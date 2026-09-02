import { Metadata } from "next"

import { ZENITEL_BRAND } from "@lib/partner-brands"
import PartnerCertificationsView from "@modules/partner-hub/components/partner-certifications-view"

export const metadata: Metadata = {
  title: ZENITEL_BRAND.certifications.metadataTitle,
  description: ZENITEL_BRAND.certifications.metadataDescription,
}

export default function ZenitelCertificationsPage() {
  return <PartnerCertificationsView config={ZENITEL_BRAND} />
}
