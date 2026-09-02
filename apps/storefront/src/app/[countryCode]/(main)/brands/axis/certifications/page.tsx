import { Metadata } from "next"

import { AXIS_BRAND } from "@lib/partner-brands"
import PartnerCertificationsView from "@modules/partner-hub/components/partner-certifications-view"

export const metadata: Metadata = {
  title: AXIS_BRAND.certifications.metadataTitle,
  description: AXIS_BRAND.certifications.metadataDescription,
}

export default function AxisCertificationsPage() {
  return <PartnerCertificationsView config={AXIS_BRAND} />
}
