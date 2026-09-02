import { Metadata } from "next"

import SpectrumCertificationsView from "@modules/spectrum/components/spectrum-certifications-view"

export const metadata: Metadata = {
  title: "Spectrum certifications",
  description:
    "ATEX, IECEx, cFMus, INMETRO, PESO and UKCA map for Spectrum Camera assemblies supplied by Supercore as regional distributor.",
}

export default function SpectrumCertificationsPage() {
  return <SpectrumCertificationsView />
}
