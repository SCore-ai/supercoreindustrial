import { HttpTypes } from "@medusajs/types"

import {
  filterPartnerSeriesProducts,
  partnerSeriesThumbnail,
  type PartnerBrandConfig,
} from "@lib/partner-brands/types"

export function partnerSeriesImage(
  config: PartnerBrandConfig,
  products: HttpTypes.StoreProduct[],
  seriesSlug: string
): string | null {
  const series = config.series.find((item) => item.slug === seriesSlug)
  if (!series) {
    return null
  }

  return partnerSeriesThumbnail(filterPartnerSeriesProducts(products, series))
}
