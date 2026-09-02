import type { PartnerBrandConfig } from "./types"

export function partnerSubnavProps(config: PartnerBrandConfig) {
  return {
    label: config.label,
    badgeLabel: config.badgeLabel,
    hubHref: config.hubHref,
    links: [
      { href: config.hubHref, label: "Shop" },
      ...config.series.map((series) => ({
        href: series.href,
        label: series.navLabel,
      })),
      {
        href: `${config.hubHref}/certifications`,
        label: config.certsNavLabel,
      },
      { href: `${config.hubHref}/about`, label: config.aboutNavLabel },
    ],
  }
}
