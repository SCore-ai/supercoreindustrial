import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { getRegion } from "@lib/data/regions"
import { ZENITEL_BRAND, getPartnerSeries } from "@lib/partner-brands"
import PartnerSeriesPage from "@modules/partner-hub/templates/partner-series-page"

type Props = {
  params: Promise<{ countryCode: string; series: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return ZENITEL_BRAND.series.map((series) => ({ series: series.slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { series: slug } = await props.params
  const series = getPartnerSeries(ZENITEL_BRAND, slug)

  if (!series) {
    return { title: ZENITEL_BRAND.label }
  }

  return {
    title: `${series.title} | ${ZENITEL_BRAND.label}`,
    description: series.description,
  }
}

export default async function ZenitelSeriesRoute(props: Props) {
  const { countryCode, series: slug } = await props.params
  const region = await getRegion(countryCode)
  const { products } = await listCollectionCatalog({
    handle: ZENITEL_BRAND.collectionHandle,
    countryCode,
    limit: 500,
  })

  return (
    <PartnerSeriesPage
      config={ZENITEL_BRAND}
      slug={slug}
      products={products}
      region={region}
    />
  )
}
