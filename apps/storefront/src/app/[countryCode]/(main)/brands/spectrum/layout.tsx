import SpectrumSubnav from "@modules/spectrum/components/spectrum-subnav"

export default function SpectrumBrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="spc-hub min-h-screen">
      <SpectrumSubnav />
      {children}
    </div>
  )
}
