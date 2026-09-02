import { HttpTypes } from "@medusajs/types"

export type PartnerBadge = "distributor" | "solution-partner"

export type PartnerSeriesMatch = {
  any: string[]
  none?: string[]
}

export type PartnerSeries = {
  slug: string
  navLabel: string
  title: string
  eyebrow: string
  href: string
  description: string
  match: PartnerSeriesMatch
}

export type PartnerHeroImage = {
  seriesSlug: string
  caption: string
  alt: string
}

export type PartnerVisualShot = {
  seriesSlug: string
  href: string
  label: string
  title: string
  alt: string
}

export type PartnerCertScheme = {
  id: string
  mark: string
  region: string
  role: string
  body: string
}

export type PartnerBrandConfig = {
  id: "zenitel" | "axis"
  collectionHandle: string
  label: string
  legalName: string
  badge: PartnerBadge
  badgeLabel: string
  hubHref: string
  catalogHref: string
  aboutNavLabel: string
  certsNavLabel: string
  metadataTitle: string
  metadataDescription: string
  hero: {
    eyebrow: string
    title: string
    body: string
    bullets: string[]
    images: PartnerHeroImage[]
  }
  intro: { title: string; body: string }[]
  visualRail: {
    eyebrow: string
    title: string
    shots: PartnerVisualShot[]
  }
  techFacts: {
    eyebrow: string
    title: string
    items: { label: string; value: string }[]
  }
  seriesHeading: string
  series: PartnerSeries[]
  landingTileOrder: string[]
  certsStrip: {
    eyebrow: string
    title: string
    body: string
    marks: { mark: string; note: string }[]
  }
  featuredHeading: string
  cta: { title: string; body: string }
  certifications: {
    metadataTitle: string
    metadataDescription: string
    eyebrow: string
    title: string
    body: string
    nav: { href: string; label: string }[]
    help: { title: string; body: string }[]
    schemesEyebrow: string
    schemesTitle: string
    schemesBody: string
    schemes: PartnerCertScheme[]
    translatorEyebrow: string
    translatorTitle: string
    translatorBody: string
    translatorRows: { left: string; mid: string; right: string }[]
    translatorHeaders: [string, string, string]
    markingEyebrow: string
    markingTitle: string
    markingBody: string
    marking: { label: string; value: string }[]
    noteTitle: string
    noteBody: string
    stepsEyebrow: string
    stepsTitle: string
    steps: { step: string; title: string; body: string }[]
  }
  about: {
    metadataTitle: string
    metadataDescription: string
    eyebrow: string
    title: string
    body: string
    shots: PartnerHeroImage[]
    splitEyebrow: string
    splitTitle: string
    manufacturerTitle: string
    manufacturerBody: string
    ourTitle: string
    ourBody: string
    pathEyebrow: string
    pathTitle: string
    path: { step: string; title: string; body: string }[]
    lineEyebrow: string
    lineTitle: string
    lineBody: string
    marketsEyebrow: string
    markets: string[]
    deskEyebrow: string
    deskTitle: string
    desk: { title: string; body: string }[]
  }
}

export function partnerProductHaystack(
  product: HttpTypes.StoreProduct
): string {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>
  return [
    metadata.category_hint,
    metadata.category_handle,
    metadata.series,
    metadata.category,
    product.title,
    product.handle,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" | ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .toLowerCase()
}

export function seriesMatchesHaystack(
  haystack: string,
  match: PartnerSeriesMatch
): boolean {
  if (match.none?.some((token) => haystack.includes(token))) {
    return false
  }

  return match.any.some((token) => haystack.includes(token))
}

export function filterPartnerSeriesProducts(
  products: HttpTypes.StoreProduct[],
  series: PartnerSeries
): HttpTypes.StoreProduct[] {
  return products.filter((product) =>
    seriesMatchesHaystack(partnerProductHaystack(product), series.match)
  )
}

export function partnerSeriesThumbnail(
  products: HttpTypes.StoreProduct[]
): string | null {
  for (const product of products) {
    const url = product.thumbnail || product.images?.[0]?.url
    if (url) {
      return url
    }
  }

  return null
}

export function getPartnerSeries(
  config: PartnerBrandConfig,
  slug: string
): PartnerSeries | undefined {
  return config.series.find((series) => series.slug === slug)
}
