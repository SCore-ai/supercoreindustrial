import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BRAND } from "@lib/brand"
import {
  SPECTRUM_ABOUT_DESK,
  SPECTRUM_ABOUT_MARKETS,
  SPECTRUM_ABOUT_PATH,
} from "@lib/spectrum/about"
import { SPECTRUM_SERIES } from "@lib/spectrum/series"
import SpectrumCta from "@modules/spectrum/components/spectrum-cta"

const HERO_SHOTS = [
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/07/TEZP-405-V02.png",
    alt: "Spectrum TEZP 316L stainless PTZ camera",
    caption: "316L · offshore / marine",
  },
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/07/D401_LTE-Wifi-LTE_3.png",
    alt: "Spectrum D-Series explosion-proof dome camera",
    caption: "D-Series · classified dome",
  },
]

const SpectrumAboutView = () => {
  return (
    <>
      <header className="relative overflow-hidden border-b border-[var(--spc-line)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative content-container grid items-center gap-10 py-14 small:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] small:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sc-cta">
              Partnership · regional distributor
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl tracking-tight text-white small:text-5xl">
              Spectrum through our desk, not a distant web cart
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--spc-muted)]">
              {BRAND.legalName} is the authorized regional distributor for
              Spectrum Camera. You specify classified-area CCTV with a local
              commercial path — live pricing, variant SKUs, and project
              documentation for oil, gas, chemical, marine, and pharmaceutical
              sites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LocalizedClientLink href="/brands/spectrum" className="spc-cta">
                Open the catalogue
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/brands/spectrum/certifications"
                className="spc-cta-ghost"
              >
                Certification map
              </LocalizedClientLink>
              <LocalizedClientLink href="/get-a-quote" className="spc-cta-ghost">
                Request a quote
              </LocalizedClientLink>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {HERO_SHOTS.map((shot) => (
              <figure
                key={shot.src}
                className="overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)]"
              >
                <div className="relative aspect-[4/5] bg-[var(--spc-elevated)]">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    priority
                    className="object-contain p-4"
                    sizes="(min-width: 1024px) 20vw, 45vw"
                  />
                </div>
                <figcaption className="border-t border-[var(--spc-line)] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </header>

      <nav
        className="content-container flex flex-wrap gap-4 py-6 text-xs uppercase tracking-[0.14em]"
        aria-label="On this page"
      >
        <a href="#role" className="text-white hover:text-sc-cta">
          Our role
        </a>
        <a href="#path" className="text-white hover:text-sc-cta">
          How to buy
        </a>
        <a href="#line" className="text-white hover:text-sc-cta">
          The line
        </a>
        <a href="#desk" className="text-white hover:text-sc-cta">
          The desk
        </a>
      </nav>

      <section id="role" className="content-container scroll-mt-36 pb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
          Two names on every package
        </p>
        <h2 className="mt-2 max-w-2xl font-display text-3xl tracking-tight text-white">
          Houston builds the camera. We sell and support it here.
        </h2>
        <div className="mt-8 grid gap-4 small:grid-cols-2">
          <article className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] p-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--spc-muted)]">
              Manufacturer
            </p>
            <h3 className="mt-2 font-display text-2xl text-white">
              Spectrum Camera Solutions
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--spc-muted)]">
              Designed and manufactured in Houston, USA. Explosion-proof
              housings around industrial imaging cores, listed for Class I
              Division 1 & 2 and Zone 1 / 2 on a model-by-model basis.
            </p>
          </article>
          <article className="rounded-lg border border-sc-cta/40 bg-[var(--spc-elevated)] p-6">
            <p className="text-[11px] uppercase tracking-[0.16em] text-sc-cta">
              Regional distributor
            </p>
            <h3 className="mt-2 font-display text-2xl text-white">
              {BRAND.legalName}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Your commercial counterpart in this territory. We price the live
              catalogue, match Connectivity / Router / Region / Antenna
              variants, and issue the datasheet plus certificate pack against
              the SKU — not a generic brochure.
            </p>
          </article>
        </div>
      </section>

      <section
        id="path"
        className="scroll-mt-36 border-y border-[var(--spc-line)] bg-[var(--spc-surface)]"
      >
        <div className="content-container py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            How a project moves
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            From drawing to a usable order
          </h2>
          <ol className="mt-8 grid gap-4 small:grid-cols-2 medium:grid-cols-4">
            {SPECTRUM_ABOUT_PATH.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-bg)] p-5"
              >
                <p className="font-mono text-sm text-sc-cta">{item.step}</p>
                <h3 className="mt-3 font-display text-xl text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--spc-muted)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
            Integrators and trade accounts can{" "}
            <LocalizedClientLink
              href="/register-trade"
              className="text-sc-cta hover:text-white"
            >
              register for a trade account
            </LocalizedClientLink>
            . Project lists and RFQs go through{" "}
            <LocalizedClientLink
              href="/get-a-quote"
              className="text-sc-cta hover:text-white"
            >
              Request a quote
            </LocalizedClientLink>
            .
          </p>
        </div>
      </section>

      <section id="line" className="content-container scroll-mt-36 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
          What we stock
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
          The Spectrum line we sell
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
          Live catalogue, same series structure as the manufacturer — priced and
          supported from our territory.
        </p>
        <ul className="mt-8 grid gap-3 small:grid-cols-2 medium:grid-cols-3">
          {SPECTRUM_SERIES.map((series) => (
            <li key={series.slug}>
              <LocalizedClientLink
                href={series.href}
                className="flex h-full flex-col rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] p-5 transition-colors hover:border-sc-cta"
              >
                <p className="text-[11px] uppercase tracking-[0.14em] text-sc-cta">
                  {series.eyebrow}
                </p>
                <h3 className="mt-1 font-display text-lg text-white">
                  {series.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--spc-muted)]">
                  {series.description}
                </p>
                <p className="mt-4 text-sm font-medium text-white">
                  Explore {series.navLabel}
                  <span className="ml-1 text-sc-cta">→</span>
                </p>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--spc-muted)]">
            Typical sites
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {SPECTRUM_ABOUT_MARKETS.map((market) => (
              <li
                key={market}
                className="rounded-full border border-[var(--spc-line)] px-3 py-1 text-xs uppercase tracking-[0.12em] text-white"
              >
                {market}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="desk"
        className="scroll-mt-36 border-t border-[var(--spc-line)] bg-[var(--spc-surface)]"
      >
        <div className="content-container py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            Why specify through us
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            A regional desk that reads the drawing
          </h2>
          <ul className="mt-8 grid gap-4 small:grid-cols-3">
            {SPECTRUM_ABOUT_DESK.map((item) => (
              <li
                key={item.title}
                className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-bg)] p-6"
              >
                <h3 className="font-display text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--spc-muted)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
          <aside className="mt-8 flex flex-col gap-3 rounded-lg border border-sc-cta/40 bg-[var(--spc-elevated)] px-6 py-5 small:flex-row small:items-center small:justify-between">
            <p className="text-sm leading-relaxed text-white/90">
              Talk to the Spectrum desk · {BRAND.phone}
            </p>
            <LocalizedClientLink href="/contact-us" className="spc-cta">
              Contact sales
            </LocalizedClientLink>
          </aside>
        </div>
      </section>

      <SpectrumCta />
    </>
  )
}

export default SpectrumAboutView
