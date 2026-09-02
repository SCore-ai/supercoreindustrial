"use client"

import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type PartnerSubnavLink = {
  href: string
  label: string
}

export type PartnerSubnavProps = {
  label: string
  badgeLabel: string
  hubHref: string
  links: PartnerSubnavLink[]
}

const PartnerSubnav = ({
  label,
  badgeLabel,
  hubHref,
  links,
}: PartnerSubnavProps) => {
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
      aria-label={`${label} catalogue`}
    >
      <div className="content-container flex flex-col gap-3 py-3 small:flex-row small:items-center small:justify-between">
        <LocalizedClientLink
          href={hubHref}
          className="font-display text-sm uppercase tracking-[0.16em] text-white"
        >
          {label}
          <span className="ml-2 text-[10px] font-semibold tracking-[0.14em] text-sc-cta">
            {badgeLabel}
          </span>
        </LocalizedClientLink>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map((link) => {
            const active =
              link.href === hubHref
                ? localPath === hubHref
                : localPath.startsWith(link.href)
            return (
              <li key={link.href}>
                <LocalizedClientLink
                  href={link.href}
                  className={`text-xs uppercase tracking-[0.12em] ${
                    active
                      ? "text-sc-cta"
                      : "text-[var(--spc-muted)] hover:text-white"
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

export default PartnerSubnav
