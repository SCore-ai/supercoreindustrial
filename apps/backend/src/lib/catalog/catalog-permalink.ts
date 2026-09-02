/**
 * Public product identity for the storefront and admin.
 * Handles must be manufacturer page slugs (or catalog folder slugs),
 * never Medusa IDs or generic manufacturer-SKU codes.
 */

export const DEFAULT_STOREFRONT_COUNTRY = "gb"
export const DEFAULT_STOREFRONT_URL = "http://localhost:8000"

const GENERIC_PATH_SEGMENTS = new Set([
  "support",
  "download",
  "downloads",
  "documentation",
  "where-to-buy",
  "print",
  "pdf",
])

export function sanitizeCatalogSlug(value?: string | null): string | null {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || null
}

export function skuProductHandle(
  manufacturerId: string,
  sku?: string | null
): string {
  return (
    sanitizeCatalogSlug(`${manufacturerId}-${sku || "product"}`) ||
    `${manufacturerId}-product`
  )
}

const BRAND_TITLE_PREFIX: Record<string, RegExp> = {
  axis: /^axis\s+/i,
  zenitel: /^zenitel\s+/i,
  spectrum: /^spectrum(?:\s+camera)?\s+/i,
  tecnovideo: /^tecnovideo\s+/i,
}

export function isSkuLikeCatalogSlug(
  manufacturerId: string,
  slug?: string | null,
  sku?: string | null
): boolean {
  const value = sanitizeCatalogSlug(slug)
  if (!value) {
    return false
  }
  const expected = skuProductHandle(manufacturerId, sku)
  if (value === expected) {
    return true
  }
  const prefix = sanitizeCatalogSlug(manufacturerId)
  const stripped =
    prefix && value.startsWith(`${prefix}-`)
      ? value.slice(prefix.length + 1)
      : value
  const skuSlug = sanitizeCatalogSlug(sku)
  if (skuSlug && stripped === skuSlug) {
    return true
  }
  const digits = stripped.replace(/-/g, "")
  return /^[0-9]+(?:-[0-9]+)*$/.test(stripped) && digits.length >= 6
}

const GARBAGE_PRODUCT_TITLES = new Set(["system.xml.xmlelement"])

export function isGarbageProductTitle(title?: string | null): boolean {
  const value = String(title || "").trim()
  if (!value) {
    return true
  }
  return GARBAGE_PRODUCT_TITLES.has(value.toLowerCase())
}

export function handleFromCategoryHint(
  categoryHint?: string | null,
  sku?: string | null
): string | null {
  const segments = String(categoryHint || "")
    .split(">")
    .map((segment) => segment.trim())
    .filter(Boolean)
  const last = segments[segments.length - 1]
  const base = clipCatalogSlug(sanitizeCatalogSlug(last))
  if (!base) {
    return null
  }
  const skuSlug = sanitizeCatalogSlug(sku)
  if (skuSlug) {
    return clipCatalogSlug(`${base}-${skuSlug}`)
  }
  return base
}

export function resolveSkuLikeProductHandle(input: {
  manufacturerId: string
  sku?: string | null
  title?: string | null
  mpn?: string | null
  categoryHint?: string | null
  catalogHandle?: string | null
}): string {
  const catalogHandle = sanitizeCatalogSlug(input.catalogHandle)
  if (
    catalogHandle &&
    !isSkuLikeCatalogSlug(input.manufacturerId, catalogHandle, input.sku)
  ) {
    return catalogHandle
  }

  const title = isGarbageProductTitle(input.title) ? null : input.title
  const fromIdentity = resolveProductHandle({
    manufacturerId: input.manufacturerId,
    sku: input.sku,
    title,
    mpn: input.mpn,
  })
  if (
    !isSkuLikeCatalogSlug(input.manufacturerId, fromIdentity, input.sku)
  ) {
    return fromIdentity
  }

  const fromCategory = handleFromCategoryHint(input.categoryHint, input.sku)
  if (
    fromCategory &&
    !isSkuLikeCatalogSlug(input.manufacturerId, fromCategory, input.sku)
  ) {
    return fromCategory
  }

  return fromIdentity
}

export function namedHandleFromIdentity(input: {
  manufacturerId: string
  title?: string | null
  mpn?: string | null
  sku?: string | null
}): string | null {
  const manufacturerId = String(input.manufacturerId || "").toLowerCase()
  const skuSlug = sanitizeCatalogSlug(input.sku)
  const brandPrefix = BRAND_TITLE_PREFIX[manufacturerId]
  const title = brandPrefix
    ? String(input.title || "").replace(brandPrefix, "").trim()
    : String(input.title || "").trim()
  const fromTitle = clipCatalogSlug(sanitizeCatalogSlug(title))
  if (
    fromTitle &&
    fromTitle !== skuSlug &&
    !isSkuLikeCatalogSlug(manufacturerId, fromTitle, input.sku)
  ) {
    return fromTitle
  }
  const fromMpn = clipCatalogSlug(sanitizeCatalogSlug(input.mpn))
  if (
    fromMpn &&
    fromMpn !== skuSlug &&
    !isSkuLikeCatalogSlug(manufacturerId, fromMpn, input.sku)
  ) {
    return fromMpn
  }
  return null
}

function clipCatalogSlug(slug: string | null, max = 80): string | null {
  if (!slug) {
    return null
  }
  if (slug.length <= max) {
    return slug
  }
  const clipped = slug.slice(0, max).replace(/-+$/g, "")
  const lastHyphen = clipped.lastIndexOf("-")
  return lastHyphen > 40 ? clipped.slice(0, lastHyphen) : clipped
}

export function catalogPermalinkSlug(
  permalink?: string | null
): string | null {
  const value = String(permalink || "").trim()
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    const parts = url.pathname.split("/").filter(Boolean)
    while (
      parts.length &&
      GENERIC_PATH_SEGMENTS.has(parts[parts.length - 1].toLowerCase())
    ) {
      parts.pop()
    }
    const last = parts[parts.length - 1]
    return sanitizeCatalogSlug(last)
  } catch {
    const match = value.match(/\/products?\/([^/?#]+)/i)
    if (match?.[1]) {
      return sanitizeCatalogSlug(match[1])
    }
    return sanitizeCatalogSlug(value)
  }
}

export function resolveProductHandle(input: {
  manufacturerId: string
  sku?: string | null
  sourceUrl?: string | null
  catalogSlug?: string | null
  title?: string | null
  mpn?: string | null
}): string {
  const fromUrl = catalogPermalinkSlug(input.sourceUrl)
  if (
    fromUrl &&
    !isSkuLikeCatalogSlug(input.manufacturerId, fromUrl, input.sku)
  ) {
    return fromUrl
  }
  const fromSlug = sanitizeCatalogSlug(input.catalogSlug)
  if (
    fromSlug &&
    !isSkuLikeCatalogSlug(input.manufacturerId, fromSlug, input.sku)
  ) {
    return fromSlug
  }
  const fromName = namedHandleFromIdentity(input)
  if (fromName) {
    return fromName
  }
  return skuProductHandle(input.manufacturerId, input.sku)
}

export function buildStorefrontProductUrl(input: {
  handle?: string | null
  storefrontUrl?: string | null
  countryCode?: string | null
}): string {
  const base = String(input.storefrontUrl || DEFAULT_STOREFRONT_URL).replace(
    /\/$/,
    ""
  )
  const country =
    sanitizeCatalogSlug(input.countryCode) || DEFAULT_STOREFRONT_COUNTRY
  const handle = sanitizeCatalogSlug(input.handle)
  if (!handle) {
    return `${base}/${country}/products`
  }
  return `${base}/${country}/products/${handle}`
}
