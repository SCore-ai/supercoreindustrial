import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { getRegion } from "@lib/data/regions"
import {
  SPECTRUM_LANDING_TILE_ORDER,
  SPECTRUM_SERIES,
  filterSpectrumSeriesProducts,
  seriesThumbnail,
} from "@lib/spectrum/series"
import SpectrumCertsStrip from "@modules/spectrum/components/spectrum-certs-strip"
import SpectrumCta from "@modules/spectrum/components/spectrum-cta"
import SpectrumDistributorIntro from "@modules/spectrum/components/spectrum-distributor-intro"
import SpectrumHero from "@modules/spectrum/components/spectrum-hero"
import SpectrumProductGrid from "@modules/spectrum/components/spectrum-product-grid"
import SpectrumSeriesGrid from "@modules/spectrum/components/spectrum-series-grid"
import SpectrumTechFacts from "@modules/spectrum/components/spectrum-tech-facts"
import SpectrumVisualRail from "@modules/spectrum/components/spectrum-visual-rail"

export const metadata: Metadata = {
  title: "Spectrum Camera | Authorized regional distributor",
  description:
    "Supercore is the regional Spectrum Camera distributor — classified-area CCTV, live pricing, and certificate packs against SKU.",
}

export default async function SpectrumHubPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  const { products } = await listCollectionCatalog({
    handle: "spectrum",
    countryCode,
  })

  const tiles = SPECTRUM_LANDING_TILE_ORDER.map((slug) => {
    const series = SPECTRUM_SERIES.find((item) => item.slug === slug)!
    const seriesProducts = filterSpectrumSeriesProducts(products, series)
    return {
      series,
      count: seriesProducts.length,
      image: seriesThumbnail(seriesProducts) ?? series.fallbackImage,
    }
  })

  const featured = SPECTRUM_SERIES.flatMap((series) => {
    const match = filterSpectrumSeriesProducts(products, series)[0]
    return match ? [match] : []
  }).slice(0, 8)

  return (
    <>
      <SpectrumHero />
      <SpectrumDistributorIntro />
      <SpectrumVisualRail />
      <SpectrumTechFacts />
      <SpectrumSeriesGrid tiles={tiles} />
      <SpectrumCertsStrip />
      {region && featured.length > 0 ? (
        <section className="content-container pb-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              Across the line
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
              One product from each series
            </h2>
          </div>
          <SpectrumProductGrid products={featured} region={region} />
        </section>
      ) : null}
      <SpectrumCta />
    </>
  )
}
