/**
 * Spectrum Camera (explosionproofcamera.com) product identity for SEO.
 * Storefront handle / product folder slug must match the public permalink slug
 * exactly, e.g. tezp-405-30-explosion-proof-camera.
 */

import {
  catalogPermalinkSlug,
  sanitizeCatalogSlug,
  skuProductHandle,
} from "./catalog-permalink"

export function spectrumPermalinkSlug(
  permalink?: string | null,
  fallbackSlug?: string | null
): string | null {
  const fromUrl = catalogPermalinkSlug(permalink)
  if (fromUrl) {
    return fromUrl
  }
  return sanitizeCatalogSlug(fallbackSlug)
}

export function spectrumProductHandle(input: {
  sku?: string | null
  permalink?: string | null
  slug?: string | null
}): string {
  const slug = spectrumPermalinkSlug(input.permalink, input.slug)
  if (slug) {
    return slug
  }
  return skuProductHandle("spectrum", input.sku)
}

export function originalFilenameFromUrl(
  url: string,
  fallback = "image.jpg"
): string {
  const clean = String(url || "").split("?")[0]
  let name = clean.split("/").filter(Boolean).pop() || fallback
  try {
    name = decodeURIComponent(name)
  } catch {
    /* keep raw basename */
  }
  name = name.replace(/[<>:"|?*\\]+/g, "-").trim()
  if (!name || name === "." || name === "..") {
    return fallback
  }
  if (!/\.[a-z0-9]{2,5}$/i.test(name)) {
    return `${name}.jpg`
  }
  return name
}
