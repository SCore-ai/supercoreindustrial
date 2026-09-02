import { Metadata } from "next"

import SpectrumAboutView from "@modules/spectrum/components/spectrum-about-view"

export const metadata: Metadata = {
  title: "Spectrum regional distributor",
  description:
    "Supercore Industrial Systems Ltd is the authorized regional distributor for Spectrum Camera — live catalogue, variant SKUs, and certificate packs.",
}

export default function SpectrumAboutPage() {
  return <SpectrumAboutView />
}
