import {
  isLegacyDevicePlacement,
  isLegacyMedusaProduct,
  legacyProductFields,
  successorHandleFromMeta,
} from "../legacy-devices"

describe("legacy-devices placement", () => {
  it("pins products already under the legacy-devices folder", () => {
    expect(
      isLegacyDevicePlacement({
        folderPath: "legacy-devices/axis-old-ptz",
      })
    ).toBe(true)
  })

  it("pins products marked eol even if they sit in a live category folder", () => {
    expect(
      isLegacyDevicePlacement({
        lifecycle: "eol",
        folderPath: "cctv-systems/cctv-ptz/axis-old-ptz",
      })
    ).toBe(true)
  })

  it("does not pin live products", () => {
    expect(
      isLegacyDevicePlacement({
        categoryHandle: "cctv-ptz",
        folderPath: "cctv-systems/cctv-ptz/axis-q6315",
      })
    ).toBe(false)
  })

  it("prefers successor_handle over successor_slug", () => {
    expect(
      successorHandleFromMeta({
        successor_handle: "axis-p1468-le",
        successor_slug: "axis-p1468-le-folder",
      })
    ).toBe("axis-p1468-le")
  })

  it("keeps the previous live category as original_category_handle", () => {
    expect(
      legacyProductFields({
        category_handle: "cctv-ptz",
        successor_handle: "axis-q6318-le",
      })
    ).toEqual({
      lifecycle: "eol",
      successor_handle: "axis-q6318-le",
      original_category_handle: "cctv-ptz",
    })
  })

  it("treats Medusa products in the legacy-devices category as EOL", () => {
    expect(
      isLegacyMedusaProduct({
        categories: [{ handle: "legacy-devices" }],
        metadata: { lifecycle: "active" },
      })
    ).toBe(true)
  })
})
