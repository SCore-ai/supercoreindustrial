"use client"

import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const LINKS = [
  { href: "/brands/spectrum", label: "Shop" },
  { href: "/brands/spectrum/d-series", label: "D-Series" },
  { href: "/brands/spectrum/f-series", label: "F-Series" },
  { href: "/brands/spectrum/tezp-fezb", label: "FEZB / TEZP" },
  { href: "/brands/spectrum/junction-boxes", label: "Junction boxes" },
  { href: "/brands/spectrum/accessories", label: "Accessories" },
  { href: "/brands/spectrum/network-accessories", label: "Network" },
  { href: "/brands/spectrum/certifications", label: "Certifications" },
  { href: "/brands/spectrum/about", label: "Distributor" },
]

const SpectrumSubnav = () => {
  const pathname = usePathname()
  const params = useParams()
  const countryCode = String(params?.countryCode ?? "")
  const localPath = countryCode
    ? pathname.replace(new RegExp(`^/${countryCode}`), "") || "/"
    : pathname

  return (
    <nav
      className="sticky top-[96px] z-30 border-b"
      style={{
        background: "var(--spc-surface)",
        borderColor: "var(--spc-line)",
      }}
      aria-label="Spectrum catalogue"
    >
      <div className="content-container flex flex-col gap-3 py-3 small:flex-row small:items-center small:justify-between">
        <LocalizedClientLink
          href="/brands/spectrum"
          className="font-display text-sm uppercase tracking-[0.16em] text-white"
        >
          Spectrum Camera
          <span className="ml-2 text-[10px] font-semibold tracking-[0.14em] text-sc-cta">
            Regional distributor
          </span>
        </LocalizedClientLink>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((link) => {
            const active =
              link.href === "/brands/spectrum"
                ? localPath === "/brands/spectrum"
                : localPath.startsWith(link.href)
            return (
              <li key={link.href}>
                <LocalizedClientLink
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.12em] ${
                    active ? "text-sc-cta" : "text-[var(--spc-muted)] hover:text-white"
                  }`}
                >
                  {link.label}
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default SpectrumSubnav
