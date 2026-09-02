import { HttpTypes } from "@medusajs/types"

export type SpectrumSeriesSlug =
  | "d-series"
  | "f-series"
  | "tezp-fezb"
  | "junction-boxes"
  | "accessories"
  | "network-accessories"

export type SpectrumSeries = {
  slug: SpectrumSeriesSlug
  navLabel: string
  title: string
  eyebrow: string
  href: string
  description: string
  fallbackImage: string
  match: (categoryHint: string) => boolean
}

function hintOf(value: string): string {
  return value.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().toLowerCase()
}

export const SPECTRUM_SERIES: SpectrumSeries[] = [
  {
    slug: "d-series",
    navLabel: "D-Series",
    title: "D-Series dome / PTZ",
    eyebrow: "Dome cameras",
    href: "/brands/spectrum/d-series",
    description:
      "Explosion-proof dome assemblies for compact mounts and wide-area coverage in classified ignition zones.",
    fallbackImage:
      "https://explosionproofcamera.com/wp-content/uploads/2026/07/D401_LTE-Wifi-LTE_3.png",
    match: (categoryHint) => {
      const hint = hintOf(categoryHint)
      return hint.includes("dome") || hint.includes("d-series")
    },
  },
  {
    slug: "f-series",
    navLabel: "F-Series",
    title: "F-Series fixed",
    eyebrow: "Fixed cameras",
    href: "/brands/spectrum/f-series",
    description:
      "Fixed bullet cameras for dedicated point monitoring, including PoE, fibre, and wireless connectivity options.",
    fallbackImage:
      "https://explosionproofcamera.com/wp-content/uploads/2026/06/F2XX-WIRELESS_DualAntenna_.Final-Color-Output.0002.png",
    match: (categoryHint) => {
      const hint = hintOf(categoryHint)
      return hint.includes("fixed") || hint.includes("f-series")
    },
  },
  {
    slug: "tezp-fezb",
    navLabel: "FEZB / TEZP",
    title: "FEZB / TEZP stainless",
    eyebrow: "316L PTZ & fixed",
    href: "/brands/spectrum/tezp-fezb",
    description:
      "316L stainless PTZ and fixed cameras for offshore, marine, and corrosive atmospheres.",
    fallbackImage:
      "https://explosionproofcamera.com/wp-content/uploads/2026/07/TEZP-405-V02.png",
    match: (categoryHint) => {
      const hint = hintOf(categoryHint)
      return hint.includes("tezp") || hint.includes("fezb")
    },
  },
  {
    slug: "junction-boxes",
    navLabel: "Junction boxes",
    title: "Junction boxes",
    eyebrow: "Enclosures",
    href: "/brands/spectrum/junction-boxes",
    description:
      "Certified enclosures for cable termination, wireless hardware, and power in classified areas.",
    fallbackImage:
      "https://explosionproofcamera.com/wp-content/uploads/2026/07/zone-five-div1-xr60-hpoe8.png",
    match: (categoryHint) => hintOf(categoryHint).includes("junction"),
  },
  {
    slug: "accessories",
    navLabel: "Accessories",
    title: "Accessories",
    eyebrow: "Mounts & glands",
    href: "/brands/spectrum/accessories",
    description:
      "Wall mounts, pole mounts, cable glands, and securing kits for complete Spectrum installs.",
    fallbackImage:
      "https://explosionproofcamera.com/wp-content/uploads/2026/07/t-wm.png",
    match: (categoryHint) => {
      const hint = hintOf(categoryHint)
      return hint.includes("accessor") && !hint.includes("network")
    },
  },
  {
    slug: "network-accessories",
    navLabel: "Network",
    title: "Network accessories",
    eyebrow: "Connectivity",
    href: "/brands/spectrum/network-accessories",
    description:
      "Industrial PoE, media converters, routers, and antennas for remote Spectrum sites.",
    fallbackImage:
      "https://explosionproofcamera.com/wp-content/uploads/2026/07/scs-hcs9021q-sfp-bt-c1d2.png",
    match: (categoryHint) => hintOf(categoryHint).includes("network"),
  },
]

export const SPECTRUM_LANDING_TILE_ORDER: SpectrumSeriesSlug[] = [
  "d-series",
  "f-series",
  "accessories",
  "network-accessories",
  "tezp-fezb",
  "junction-boxes",
]

export function getSpectrumSeries(slug: string): SpectrumSeries | undefined {
  return SPECTRUM_SERIES.find((series) => series.slug === slug)
}

export function spectrumCategoryHint(
  product: HttpTypes.StoreProduct
): string {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>
  return [metadata.category_hint, metadata.series, metadata.category]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" | ")
}

export function filterSpectrumSeriesProducts(
  products: HttpTypes.StoreProduct[],
  series: SpectrumSeries
): HttpTypes.StoreProduct[] {
  return products.filter((product) => series.match(spectrumCategoryHint(product)))
}

export function seriesThumbnail(
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
