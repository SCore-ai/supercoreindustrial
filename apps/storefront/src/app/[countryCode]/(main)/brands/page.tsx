import { Metadata } from "next"

import { getNavBrands } from "@lib/brands"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: {
    absolute: "Shop by brand | Supercore",
  },
  description:
    "Spectrum Camera (regional distributor), Zenitel (AZ / TM / UZ Safety & Security and worldwide Maritime & Energy), and Axis Solution Partner catalogues.",
}

export default function BrandsIndexPage() {
  const brands = getNavBrands()
  const featured = brands.find((brand) => brand.featured)
  const others = brands.filter((brand) => !brand.featured)

  return (
    <div className="bg-white">
      {featured ? (
        <section className="bg-sc-ink text-white">
          <div className="content-container py-16 small:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              Featured · {featured.badgeLabel.toLowerCase()}
            </p>
            <h1 className="mt-3 font-display text-4xl tracking-tight">
              {featured.label} Camera
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {featured.blurb}
            </p>
            <LocalizedClientLink
              href={featured.href}
              className="mt-8 inline-flex rounded-md bg-sc-cta px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sc-ink hover:bg-sc-cta-hover"
            >
              Enter Spectrum shop
            </LocalizedClientLink>
          </div>
        </section>
      ) : null}

      <section className="content-container py-14">
        <h2 className="font-display text-2xl tracking-tight text-sc-ink">
          Partner brand desks
        </h2>
        <ul className="mt-8 grid gap-6 small:grid-cols-2">
          {others.map((brand) => (
            <li
              key={brand.id}
              className="rounded-lg border border-sc-line p-6"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sc-signal">
                {brand.badgeLabel}
              </p>
              <h3 className="mt-2 font-display text-xl text-sc-ink">
                {brand.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sc-steel">
                {brand.blurb}
              </p>
              <LocalizedClientLink
                href={brand.href}
                className="mt-5 inline-flex text-sm font-semibold uppercase tracking-[0.08em] text-sc-ink hover:text-sc-cta"
              >
                Enter {brand.label} shop →
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
