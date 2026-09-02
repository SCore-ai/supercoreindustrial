import {
  buildProductOptions,
  groupItemsByParent,
  variantOptionMap,
  variantTitle,
} from "../import-grouping"
import { mapZenitelRows, parseCsv } from "../zenitel-parser"

describe("Spectrum variant CSV grouping", () => {
  it("parses Connectivity/Router/Region/Antenna columns onto options", () => {
    const csv = [
      "sku,parent_sku,title,price,usd_price,category,connectivity,router,region,antenna,variant_label",
      'F201-Q1715-01-01,F201-A-Q1715,F201 Explosion-Proof Camera - Q1715,7714.23,7714.23,Fixed Cameras,Wired (PoE),N/A,N/A,N/A,"Connectivity: Wired (PoE), Router: N/A, Region: N/A, Antenna: N/A"',
      "F201-Q1715-02-03-02-RUT241-01-L,F201-A-Q1715,F201 Explosion-Proof Camera - Q1715,9008.50,9008.50,Fixed Cameras,Wireless,Teltonika RUT241 (4G),Global,LTE,Wireless LTE",
    ].join("\n")

    const mapped = mapZenitelRows(parseCsv(csv), "usd")
    expect(mapped.skipped).toEqual([])
    expect(mapped.items).toHaveLength(2)
    expect(mapped.items[0].parent_sku).toBe("F201-A-Q1715")
    expect(mapped.items[0].options).toEqual({
      Connectivity: "Wired (PoE)",
      Router: "N/A",
      Region: "N/A",
      Antenna: "N/A",
    })
    expect(mapped.items[1].options?.Router).toBe("Teltonika RUT241 (4G)")
    expect(mapped.items[1].options?.Region).toBe("Global")
  })

  it("keeps comma-containing region values on a single option", () => {
    const csv = [
      "sku,parent_sku,title,price,connectivity,router,region,antenna",
      "SKU-1,F201-A-Q1715,F201,9008.50,Wireless,Teltonika RUT241 (4G),\"EMEA, Thailand & Korea\",LTE + WiFi",
    ].join("\n")

    const mapped = mapZenitelRows(parseCsv(csv), "usd")
    expect(mapped.items[0].options?.Region).toBe("EMEA, Thailand & Korea")
    expect(mapped.items[0].options?.Antenna).toBe("LTE + WiFi")
  })

  it("groups variation rows onto one parent product with four options", () => {
    const csv = [
      "sku,parent_sku,title,price,connectivity,router,region,antenna,variant_label",
      "F201-Q1715-01-01,F201-A-Q1715,F201 Q1715,7714.23,Wired (PoE),N/A,N/A,N/A,Wired (PoE)",
      "F201-Q1715-MC,F201-A-Q1715,F201 Q1715,8200,Media Converter,N/A,N/A,N/A,Media Converter",
      "F201-Q1715-W1,F201-A-Q1715,F201 Q1715,9008.50,Wireless,Teltonika RUT241 (4G),Global,LTE,Wireless LTE",
      "F201-Q1715-W2,F201-A-Q1715,F201 Q1715,9808.50,Wireless,Teltonika RUT271 (5G),North America,Dual LTE,Wireless Dual LTE",
      "TRIPOD,,Spectrum Tripod,3000,,,,,",
    ].join("\n")

    const mapped = mapZenitelRows(parseCsv(csv), "usd")
    const groups = groupItemsByParent(mapped.items)
    expect(groups).toHaveLength(2)

    const camera = groups.find((group) => group.parentSku === "F201-A-Q1715")
    expect(camera?.items).toHaveLength(4)
    const built = buildProductOptions(camera.items)
    expect(built.isDefault).toBe(false)
    expect(built.options.map((option) => option.title)).toEqual([
      "Connectivity",
      "Router",
      "Region",
      "Antenna",
    ])
    expect(built.options[0].values).toEqual(
      expect.arrayContaining(["Wired (PoE)", "Media Converter", "Wireless"])
    )
    expect(
      variantOptionMap(camera.items[0], ["Connectivity", "Router", "Region", "Antenna"], false)
    ).toEqual({
      Connectivity: "Wired (PoE)",
      Router: "N/A",
      Region: "N/A",
      Antenna: "N/A",
    })
    expect(
      variantTitle(camera.items[0], ["Connectivity", "Router", "Region", "Antenna"], false)
    ).toBe("Wired (PoE)")

    const tripod = groups.find((group) => group.parentSku === "TRIPOD")
    expect(buildProductOptions(tripod.items).isDefault).toBe(true)
  })
})
