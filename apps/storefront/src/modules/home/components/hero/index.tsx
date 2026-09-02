"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BRAND } from "@lib/brand"
import Image from "next/image"

const Hero = () => {
  return (
    <section className="relative isolate min-h-[88vh] w-full overflow-hidden bg-sc-ink text-white">
      <Image
        src="/brand/hero.jpg"
        alt="Industrial facility systems and field engineering"
        fill
        priority
        className="object-cover object-center scale-105 animate-hero-zoom"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-sc-ink via-sc-ink/88 to-sc-ink/35" />
      <div className="absolute inset-0 sc-grid-overlay opacity-40" />

      <div className="relative z-10 content-container flex min-h-[88vh] flex-col justify-end pb-16 pt-28 small:justify-center small:pb-24 small:pt-24">
        <div className="max-w-3xl animate-hero-rise">
          <p className="font-display text-5xl small:text-7xl tracking-[0.12em] uppercase text-white">
            {BRAND.name}
          </p>
          <h1 className="mt-6 max-w-2xl font-display text-3xl small:text-5xl leading-[1.05] tracking-tight text-white">
            Connectivity built for hazardous and marine operations
          </h1>
          <p className="mt-5 max-w-xl text-base small:text-lg leading-relaxed text-white/80">
            {BRAND.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center bg-sc-cta px-6 py-3 font-display text-sm tracking-[0.14em] uppercase text-white transition-colors duration-300 hover:bg-sc-cta-hover hover:-translate-y-0.5"
            >
              Browse catalog
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/categories/cctv-systems"
              className="inline-flex items-center border border-white/40 px-6 py-3 font-display text-sm tracking-[0.14em] uppercase text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              Explore CCTV
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
