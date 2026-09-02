import PartnerSubnav from "@modules/partner-hub/components/partner-subnav"
import { ZENITEL_BRAND, partnerSubnavProps } from "@lib/partner-brands"

export default function ZenitelBrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="spc-hub min-h-screen">
      <PartnerSubnav
        {...partnerSubnavProps(ZENITEL_BRAND)}
        badgeLabel="Regional distributor"
      />
      {children}
    </div>
  )
}
