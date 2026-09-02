import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { getRegion } from "@lib/data/regions"
import { ZENITEL_BRAND } from "@lib/partner-brands"
import PartnerHubPage from "@modules/partner-hub/templates/partner-hub-page"

export const metadata: Metadata = {
  title: ZENITEL_BRAND.metadataTitle,
  description: ZENITEL_BRAND.metadataDescription,
}

export default async function ZenitelHubPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  const { products } = await listCollectionCatalog({
    handle: ZENITEL_BRAND.collectionHandle,
    countryCode,
    limit: 500,
  })

  return (
    <PartnerHubPage
      config={ZENITEL_BRAND}
      products={products}
      region={region}
    />
  )
}
