import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { partnerSeriesImage } from "@lib/partner-brands/images"
import { ZENITEL_BRAND } from "@lib/partner-brands"
import PartnerAboutView from "@modules/partner-hub/components/partner-about-view"

export const metadata: Metadata = {
  title: ZENITEL_BRAND.about.metadataTitle,
  description: ZENITEL_BRAND.about.metadataDescription,
}

export default async function ZenitelAboutPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { products } = await listCollectionCatalog({
    handle: ZENITEL_BRAND.collectionHandle,
    countryCode,
    limit: 500,
  })

  const shots = ZENITEL_BRAND.about.shots.map((shot) => ({
    src: partnerSeriesImage(ZENITEL_BRAND, products, shot.seriesSlug),
    caption: shot.caption,
    alt: shot.alt,
  }))

  return <PartnerAboutView config={ZENITEL_BRAND} shots={shots} />
}
