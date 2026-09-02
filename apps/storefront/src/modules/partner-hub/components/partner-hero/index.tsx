import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { PartnerBrandConfig } from "@lib/partner-brands/types"

type PartnerHeroProps = {
  config: PartnerBrandConfig
  images: { src: string; caption: string; alt: string }[]
}

const PartnerHero = ({ config, images }: PartnerHeroProps) => {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative content-container grid items-center gap-10 py-14 small:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] small:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sc-cta">
            {config.hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl tracking-tight text-white small:text-5xl">
            {config.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--spc-muted)] small:text-lg">
            {config.hero.body}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            {config.hero.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-sc-cta">—</span>
                {bullet}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocalizedClientLink href={config.catalogHref} className="spc-cta">
              Shop the catalogue
            </LocalizedClientLink>
            <LocalizedClientLink
              href={`${config.hubHref}/certifications`}
              className="spc-cta-ghost"
            >
              View certifications
            </LocalizedClientLink>
            <LocalizedClientLink href="/get-a-quote" className="spc-cta-ghost">
              Request a quote
            </LocalizedClientLink>
          </div>
        </div>
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => (
              <figure
                key={image.caption}
                className="overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)]"
              >
                <div className="relative aspect-[4/5] bg-[var(--spc-elevated)]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority
                    className="object-contain p-4"
                    sizes="(min-width: 1024px) 22vw, 45vw"
                  />
                </div>
                <figcaption className="border-t border-[var(--spc-line)] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
                  {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default PartnerHero
