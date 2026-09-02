import PartnerSubnav from "@modules/partner-hub/components/partner-subnav"
import { AXIS_BRAND, partnerSubnavProps } from "@lib/partner-brands"

export default function AxisBrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="spc-hub min-h-screen">
      <PartnerSubnav {...partnerSubnavProps(AXIS_BRAND)} />
      {children}
    </div>
  )
}
