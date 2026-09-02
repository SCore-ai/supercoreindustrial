import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import {
  filterPartnerSeriesProducts,
  getPartnerSeries,
  type PartnerBrandConfig,
} from "@lib/partner-brands/types"
import PartnerCta from "@modules/partner-hub/components/partner-cta"
import PartnerProductGrid from "@modules/partner-hub/components/partner-product-grid"
import PartnerSeriesHero from "@modules/partner-hub/components/partner-series-hero"

const PartnerSeriesPage = ({
  config,
  slug,
  products,
  region,
}: {
  config: PartnerBrandConfig
  slug: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion | null
}) => {
  const series = getPartnerSeries(config, slug)

  if (!series) {
    notFound()
  }

  const seriesProducts = filterPartnerSeriesProducts(products, series)

  return (
    <>
      <PartnerSeriesHero
        hubHref={config.hubHref}
        eyebrow={`${config.label} · ${series.eyebrow}`}
        title={series.title}
        description={series.description}
      />
      <section className="content-container pb-16">
        {region ? (
          <PartnerProductGrid
            products={seriesProducts}
            region={region}
            emptyLabel={`Products for this series are being published. Request a quote and we will match the ${config.label} SKU.`}
          />
        ) : null}
      </section>
      <PartnerCta config={config} />
    </>
  )
}

export default PartnerSeriesPage
