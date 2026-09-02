import {
  buildStorefrontProductUrl,
  catalogPermalinkSlug,
  handleFromCategoryHint,
  isGarbageProductTitle,
  isSkuLikeCatalogSlug,
  namedHandleFromIdentity,
  resolveProductHandle,
  resolveSkuLikeProductHandle,
  skuProductHandle,
} from "../catalog-permalink"

describe("catalog permalink identity", () => {
  it("uses the last product path segment from manufacturer URLs", () => {
    expect(
      catalogPermalinkSlug(
        "https://explosionproofcamera.com/product/tezp-405-30-explosion-proof-camera/"
      )
    ).toBe("tezp-405-30-explosion-proof-camera")
    expect(
      catalogPermalinkSlug("https://www.axis.com/products/axis-q6318-le")
    ).toBe("axis-q6318-le")
    expect(
      catalogPermalinkSlug(
        "https://www.axis.com/products/axis-q6318-le/support"
      )
    ).toBe("axis-q6318-le")
    expect(
      catalogPermalinkSlug(
        "https://www.tecnovideocctv.com/products/atex-hazardous-area/txptv4-ptz-camera-station"
      )
    ).toBe("txptv4-ptz-camera-station")
    expect(
      catalogPermalinkSlug(
        "https://www.zenitel.com/product/tcis-1-audio-intercom"
      )
    ).toBe("tcis-1-audio-intercom")
  })

  it("prefers manufacturer URL, then catalog slug, then sku handle", () => {
    expect(
      resolveProductHandle({
        manufacturerId: "axis",
        sku: "02446-003",
        sourceUrl: "https://www.axis.com/products/axis-q6318-le",
        catalogSlug: "axis-q6318-le",
      })
    ).toBe("axis-q6318-le")
    expect(
      resolveProductHandle({
        manufacturerId: "axis",
        sku: "02446-003",
        catalogSlug: "axis-q6318-le",
      })
    ).toBe("axis-q6318-le")
    expect(
      resolveProductHandle({
        manufacturerId: "zenitel",
        sku: "1008111010",
        catalogSlug: "zenitel-tcis-1",
      })
    ).toBe("zenitel-tcis-1")
    expect(
      resolveProductHandle({
        manufacturerId: "tecnovideo",
        sku: "TXPTV4",
        sourceUrl:
          "https://www.tecnovideocctv.com/products/atex-hazardous-area/txptv4-ptz-camera-station",
      })
    ).toBe("txptv4-ptz-camera-station")
    expect(
      resolveProductHandle({
        manufacturerId: "axis",
        sku: "02446-003",
      })
    ).toBe("axis-02446-003")
  })

  it("treats manufacturer-SKU folder names as sku-like", () => {
    expect(
      isSkuLikeCatalogSlug("zenitel", "zenitel-2220010057", "2220010057")
    ).toBe(true)
    expect(
      isSkuLikeCatalogSlug("zenitel", "zenitel-ak5850b", "AK5850B")
    ).toBe(true)
    expect(
      isSkuLikeCatalogSlug("zenitel", "zenitel-tcis-1", "1008111010")
    ).toBe(false)
  })

  it("names accessories from category hint when the pricelist title is garbage", () => {
    expect(isGarbageProductTitle("System.Xml.XmlElement")).toBe(true)
    expect(
      handleFromCategoryHint(
        "Intercom licenses > AlphaCom XE licenses",
        "1009648093"
      )
    ).toBe("alphacom-xe-licenses-1009648093")
    expect(
      resolveSkuLikeProductHandle({
        manufacturerId: "zenitel",
        sku: "1009648093",
        title: "System.Xml.XmlElement",
        mpn: "1009648093",
        categoryHint: "Intercom licenses > AlphaCom XE licenses",
      })
    ).toBe("alphacom-xe-licenses-1009648093")
  })

  it("names accessories from the product title when no manufacturer page exists", () => {
    expect(
      namedHandleFromIdentity({
        manufacturerId: "zenitel",
        title: "12 port LC Duplex Fibre Optic Patch Panel Singlemode complete",
        sku: "2220010057",
        mpn: "2220010057",
      })
    ).toBe("12-port-lc-duplex-fibre-optic-patch-panel-singlemode-complete")
    expect(
      resolveProductHandle({
        manufacturerId: "zenitel",
        sku: "2220010057",
        sourceUrl: "https://example.com/products/zenitel-2220010057",
        catalogSlug: "zenitel-2220010057",
        title: "12 port LC Duplex Fibre Optic Patch Panel Singlemode complete",
        mpn: "2220010057",
      })
    ).toBe("12-port-lc-duplex-fibre-optic-patch-panel-singlemode-complete")
  })

  it("builds the public storefront product URL", () => {
    expect(
      buildStorefrontProductUrl({
        handle: "tezp-405-30-explosion-proof-camera",
      })
    ).toBe(
      "http://localhost:8000/gb/products/tezp-405-30-explosion-proof-camera"
    )
    expect(skuProductHandle("zenitel", "1008111010")).toBe("zenitel-1008111010")
  })
})
