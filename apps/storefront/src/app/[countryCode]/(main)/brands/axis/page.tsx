import { Metadata } from "next"

import { listCollectionCatalog } from "@lib/data/brand-catalog"
import { getRegion } from "@lib/data/regions"
import { AXIS_BRAND } from "@lib/partner-brands"
import PartnerHubPage from "@modules/partner-hub/templates/partner-hub-page"

export const metadata: Metadata = {
  title: AXIS_BRAND.metadataTitle,
  description: AXIS_BRAND.metadataDescription,
}

export default async function AxisHubPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)
  const { products } = await listCollectionCatalog({
    handle: AXIS_BRAND.collectionHandle,
    countryCode,
    limit: 300,
  })

  return (
    <PartnerHubPage config={AXIS_BRAND} products={products} region={region} />
  )
}
