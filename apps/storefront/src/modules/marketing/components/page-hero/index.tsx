import Image from "next/image"

import type { SitePage } from "@lib/site-pages"

type PageHeroProps = {
  hero: NonNullable<SitePage["hero"]>
}

const PageHero = ({ hero }: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-sc-ink text-white">
      {hero.image && (
        <>
          <Image
            src={hero.image}
            alt={hero.imageAlt || hero.heading}
            fill
            priority
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sc-ink via-sc-ink/90 to-sc-ink/60" />
        </>
      )}

      <div className="relative content-container py-16 small:py-24">
        {hero.eyebrow && (
          <span className="inline-flex rounded-full bg-sc-cta px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-sc-ink">
            {hero.eyebrow}
          </span>
        )}
        <h1 className="mt-4 max-w-4xl text-[36px] small:text-[44px] leading-[1.1] font-normal tracking-tight">
          {hero.heading}
        </h1>
        {hero.subheading && (
          <p className="mt-5 max-w-3xl text-base small:text-lg leading-relaxed text-white/85">
            {hero.subheading}
          </p>
        )}
      </div>
    </section>
  )
}

export default PageHero
