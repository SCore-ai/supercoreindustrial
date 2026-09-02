import {
  buildCategoryHandleIndex,
  medusaCategoryHandle,
} from "../medusa-category-assignment"

describe("medusaCategoryHandle", () => {
  const index = buildCategoryHandleIndex()

  it("keeps depth-1 handles unchanged", () => {
    expect(medusaCategoryHandle("cctv-dome", 1, index)).toBe("cctv-dome")
    expect(medusaCategoryHandle("intercom-ip-sip", 1, index)).toBe(
      "intercom-ip-sip"
    )
    expect(medusaCategoryHandle("ex-accessories", 1, index)).toBe(
      "ex-accessories"
    )
  })

  it("collapses depth-2 ex accessory leaves to ex-accessories", () => {
    expect(medusaCategoryHandle("ex-mounts", 1, index)).toBe("ex-accessories")
    expect(medusaCategoryHandle("ex-tools", 1, index)).toBe("ex-accessories")
    expect(medusaCategoryHandle("ex-power-connectivity", 1, index)).toBe(
      "ex-accessories"
    )
  })

  it("collapses depth-2 ex camera leaves to ex-cameras", () => {
    expect(medusaCategoryHandle("ex-zone1-cameras", 1, index)).toBe(
      "ex-cameras"
    )
  })

  it("returns null for unmapped handles", () => {
    expect(medusaCategoryHandle("_unmapped", 1, index)).toBeNull()
    expect(medusaCategoryHandle("", 1, index)).toBeNull()
  })
})
