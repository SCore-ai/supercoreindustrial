import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { getRegion } from "@lib/data/regions"
import { AXIS_BRAND, getPartnerSeries } from "@lib/partner-brands"
import PartnerSeriesPage from "@modules/partner-hub/templates/partner-series-page"

type Props = {
  params: Promise<{ countryCode: string; series: string }>
}

export const dynamicParams = false

export async function generateStaticParams() {
  return AXIS_BRAND.series.map((series) => ({ series: series.slug }))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { series: slug } = await props.params
  const series = getPartnerSeries(AXIS_BRAND, slug)

  if (!series) {
    return { title: AXIS_BRAND.label }
  }

  return {
    title: `${series.title} | ${AXIS_BRAND.label}`,
    description: series.description,
  }
}

export default async function AxisSeriesRoute(props: Props) {
  const { countryCode, series: slug } = await props.params
  const region = await getRegion(countryCode)
  const { products } = await listCollectionCatalog({
    handle: AXIS_BRAND.collectionHandle,
    countryCode,
    limit: 300,
  })

  return (
    <PartnerSeriesPage
      config={AXIS_BRAND}
      slug={slug}
      products={products}
      region={region}
    />
  )
}
