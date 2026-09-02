import { HttpTypes } from "@medusajs/types"

import {
  filterPartnerSeriesProducts,
  partnerSeriesThumbnail,
  type PartnerBrandConfig,
} from "@lib/partner-brands/types"
import { partnerSeriesImage } from "@lib/partner-brands/images"
import PartnerCertsStrip from "@modules/partner-hub/components/partner-certs-strip"
import PartnerCta from "@modules/partner-hub/components/partner-cta"
import PartnerHero from "@modules/partner-hub/components/partner-hero"
import PartnerIntro from "@modules/partner-hub/components/partner-intro"
import PartnerProductGrid from "@modules/partner-hub/components/partner-product-grid"
import PartnerSeriesGrid from "@modules/partner-hub/components/partner-series-grid"
import PartnerTechFacts from "@modules/partner-hub/components/partner-tech-facts"
import PartnerVisualRail from "@modules/partner-hub/components/partner-visual-rail"

const PartnerHubPage = ({
  config,
  products,
  region,
}: {
  config: PartnerBrandConfig
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion | null
}) => {
  const tiles = config.landingTileOrder.flatMap((slug) => {
    const series = config.series.find((item) => item.slug === slug)
    if (!series) {
      return []
    }

    const seriesProducts = filterPartnerSeriesProducts(products, series)
    return [
      {
        series,
        count: seriesProducts.length,
        image: partnerSeriesThumbnail(seriesProducts),
      },
    ]
  })

  const featured = config.series.flatMap((series) => {
    const match = filterPartnerSeriesProducts(products, series)[0]
    return match ? [match] : []
  }).slice(0, 8)

  const heroImages = config.hero.images.flatMap((image) => {
    const src = partnerSeriesImage(config, products, image.seriesSlug)
    return src
      ? [{ src, caption: image.caption, alt: image.alt }]
      : []
  })

  const visualShots = config.visualRail.shots.map((shot) => ({
    src: partnerSeriesImage(config, products, shot.seriesSlug),
    href: shot.href,
    label: shot.label,
    title: shot.title,
    alt: shot.alt,
  }))

  return (
    <>
      <PartnerHero config={config} images={heroImages} />
      <PartnerIntro config={config} />
      <PartnerVisualRail config={config} shots={visualShots} />
      <PartnerTechFacts config={config} />
      <PartnerSeriesGrid heading={config.seriesHeading} tiles={tiles} />
      <PartnerCertsStrip config={config} />
      {region && featured.length > 0 ? (
        <section className="content-container pb-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              Across the line
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
              {config.featuredHeading}
            </h2>
          </div>
          <PartnerProductGrid
            products={featured}
            region={region}
            emptyLabel={`Products for ${config.label} are being published. Request a quote and we will match the SKU.`}
          />
        </section>
      ) : null}
      <PartnerCta config={config} />
    </>
  )
}

export default PartnerHubPage
