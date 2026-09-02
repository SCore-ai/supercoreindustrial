import {
  originalFilenameFromUrl,
  spectrumPermalinkSlug,
  spectrumProductHandle,
} from "../spectrum-permalink"
import { groupItemsByParent } from "../import-grouping"
import { mapZenitelRows, parseCsv } from "../zenitel-parser"

describe("Spectrum permalink identity", () => {
  it("uses the public product slug from explosionproofcamera.com", () => {
    expect(
      spectrumPermalinkSlug(
        "https://explosionproofcamera.com/product/tezp-405-30-explosion-proof-camera/"
      )
    ).toBe("tezp-405-30-explosion-proof-camera")
    expect(
      spectrumProductHandle({
        sku: "TEZP-405-30",
        permalink:
          "https://explosionproofcamera.com/product/tezp-405-30-explosion-proof-camera/",
      })
    ).toBe("tezp-405-30-explosion-proof-camera")
  })

  it("falls back to spectrum-sku only when permalink is missing", () => {
    expect(spectrumProductHandle({ sku: "TEZP-405-30" })).toBe(
      "spectrum-tezp-405-30"
    )
  })

  it("keeps the manufacturer original image filename", () => {
    expect(
      originalFilenameFromUrl(
        "https://explosionproofcamera.com/wp-content/uploads/2026/07/TEZP-405-V02.png?fit=1200"
      )
    ).toBe("TEZP-405-V02.png")
  })
})

describe("Spectrum price list description + permalink", () => {
  it("parses description and permalink from the USD list", () => {
    const csv = [
      "sku,parent_sku,title,description,price,permalink",
      'TEZP-405-30,,TEZP-405-30 Explosion-Proof Camera,"Explosion-proof PTZ network camera with 40x optical zoom.",24541.67,https://explosionproofcamera.com/product/tezp-405-30-explosion-proof-camera/',
    ].join("\n")
    const mapped = mapZenitelRows(parseCsv(csv), "usd")
    expect(mapped.items[0].title).toBe("TEZP-405-30 Explosion-Proof Camera")
    expect(mapped.items[0].description).toMatch(/40x optical zoom/)
    expect(mapped.items[0].source_url).toBe(
      "https://explosionproofcamera.com/product/tezp-405-30-explosion-proof-camera/"
    )
    const groups = groupItemsByParent(mapped.items)
    expect(groups[0].description).toMatch(/40x optical zoom/)
    expect(groups[0].source_url).toContain(
      "/product/tezp-405-30-explosion-proof-camera/"
    )
  })
})
