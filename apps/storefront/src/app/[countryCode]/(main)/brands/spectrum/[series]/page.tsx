import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { getRegion } from "@lib/data/regions"
import {
  SPECTRUM_SERIES,
  filterSpectrumSeriesProducts,
  getSpectrumSeries,
} from "@lib/spectrum/series"
import SpectrumProductGrid from "@modules/spectrum/components/spectrum-product-grid"
import SpectrumSeriesHero from "@modules/spectrum/components/spectrum-series-hero"
import SpectrumCta from "@modules/spectrum/components/spectrum-cta"

type Props = {
  params: Promise<{ countryCode: string; series: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return SPECTRUM_SERIES.map((series) => ({ series: series.slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { series: slug } = await props.params
  const series = getSpectrumSeries(slug)

  if (!series) {
    return { title: "Spectrum Camera" }
  }

  return {
    title: `${series.title} | Spectrum Camera`,
    description: series.description,
  }
}

export default async function SpectrumSeriesPage(props: Props) {
  const { countryCode, series: slug } = await props.params
  const series = getSpectrumSeries(slug)

  if (!series) {
    notFound()
  }

  const region = await getRegion(countryCode)
  const { products } = await listCollectionCatalog({
    handle: "spectrum",
    countryCode,
  })
  const seriesProducts = filterSpectrumSeriesProducts(products, series)

  return (
    <>
      <SpectrumSeriesHero
        eyebrow={`Spectrum · ${series.eyebrow}`}
        title={series.title}
        description={series.description}
      />
      <section className="content-container pb-16">
        {region ? (
          <SpectrumProductGrid products={seriesProducts} region={region} />
        ) : null}
      </section>
      <SpectrumCta />
    </>
  )
}
