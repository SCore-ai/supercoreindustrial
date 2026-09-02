import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { partnerSeriesImage } from "@lib/partner-brands/images"
import { AXIS_BRAND } from "@lib/partner-brands"
import PartnerAboutView from "@modules/partner-hub/components/partner-about-view"

export const metadata: Metadata = {
  title: AXIS_BRAND.about.metadataTitle,
  description: AXIS_BRAND.about.metadataDescription,
}

export default async function AxisAboutPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { products } = await listCollectionCatalog({
    handle: AXIS_BRAND.collectionHandle,
    countryCode,
    limit: 300,
  })

  const shots = AXIS_BRAND.about.shots.map((shot) => ({
    src: partnerSeriesImage(AXIS_BRAND, products, shot.seriesSlug),
    caption: shot.caption,
    alt: shot.alt,
  }))

  return <PartnerAboutView config={AXIS_BRAND} shots={shots} />
}
