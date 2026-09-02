/**
 * Live catalogue brands — ordered for nav, hubs, and homepage rails.
 * Tecnovideo stays in Medusa but is never promoted in storefront nav.
 */

export type CatalogBrandHub = "spectrum" | "partner" | "catalog"

export type CatalogBrandBadge = "distributor" | "solution-partner"

export type CatalogBrand = {
  id: string
  label: string
  href: string
  collectionHandle: string
  nav: boolean
  featured: boolean
  hub: CatalogBrandHub
  blurb: string
  badge: CatalogBrandBadge
  badgeLabel: string
}

export const HIDDEN_BRAND_HANDLES = ["tecnovideo"] as const

export const CATALOG_BRANDS: CatalogBrand[] = [
  {
    id: "spectrum",
    label: "Spectrum",
    href: "/brands/spectrum",
    collectionHandle: "spectrum",
    nav: true,
    featured: true,
    hub: "spectrum",
    badge: "distributor",
    badgeLabel: "Distributor",
    blurb:
      "Authorized regional distributor — explosion-proof cameras, junction boxes, and hazardous-area accessories.",
  },
  {
    id: "axis",
    label: "Axis",
    href: "/brands/axis",
    collectionHandle: "axis",
    nav: true,
    featured: false,
    hub: "partner",
    badge: "solution-partner",
    badgeLabel: "Solution Partner",
    blurb:
      "Certified Axis Solution Partner with two Axis Certified Professionals in-house — network video, audio, access control, and analytics.",
  },
  {
    id: "zenitel",
    label: "Zenitel",
    href: "/brands/zenitel",
    collectionHandle: "zenitel",
    nav: true,
    featured: false,
    hub: "partner",
    badge: "distributor",
    badgeLabel: "Distributor",
    blurb:
      "Safety & Security distributor for Azerbaijan, Turkmenistan and Uzbekistan, and Worldwide Distributor for Zenitel Maritime & Energy.",
  },
]

export function getNavBrands(): CatalogBrand[] {
  return CATALOG_BRANDS.filter((brand) => brand.nav)
}

export function getBrandById(id: string): CatalogBrand | undefined {
  return CATALOG_BRANDS.find((brand) => brand.id === id)
}

export function getBrandByCollectionHandle(
  handle: string | null | undefined
): CatalogBrand | undefined {
  if (!handle) {
    return undefined
  }

  return CATALOG_BRANDS.find((brand) => brand.collectionHandle === handle)
}

export function brandHubHref(handle: string | null | undefined): string {
  const brand = getBrandByCollectionHandle(handle)
  if (brand) {
    return brand.href
  }

  if (!handle) {
    return "/brands"
  }

  return `/collections/${handle}`
}

export function isHiddenBrandHandle(handle: string | null | undefined): boolean {
  if (!handle) {
    return false
  }

  return (HIDDEN_BRAND_HANDLES as readonly string[]).includes(handle)
}

export function isNavBrandHandle(handle: string | null | undefined): boolean {
  if (!handle || isHiddenBrandHandle(handle)) {
    return false
  }

  return CATALOG_BRANDS.some(
    (brand) => brand.nav && brand.collectionHandle === handle
  )
}

export function sortCollectionsForStorefront<T extends { handle?: string | null }>(
  collections: T[]
): T[] {
  const order = new Map(
    CATALOG_BRANDS.map((brand, index) => [brand.collectionHandle, index])
  )

  return [...collections]
    .filter((collection) => !isHiddenBrandHandle(collection.handle))
    .sort((a, b) => {
      const aRank = order.get(a.handle ?? "") ?? 100
      const bRank = order.get(b.handle ?? "") ?? 100
      return aRank - bRank
    })
}
