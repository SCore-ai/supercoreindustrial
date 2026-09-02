import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const HERO_IMAGES = [
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/07/D401_LTE-Wifi-LTE_3.png",
    alt: "Spectrum D-Series explosion-proof dome camera",
    caption: "D-Series · dome / PTZ",
  },
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/06/F2XX-WIRELESS_DualAntenna_.Final-Color-Output.0002.png",
    alt: "Spectrum F-Series explosion-proof fixed camera",
    caption: "F-Series · fixed / wireless",
  },
]

const SpectrumHero = () => {
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
            Supercore · authorized regional distributor
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl tracking-tight text-white small:text-5xl">
            Spectrum Camera, specified and supplied from our territory
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--spc-muted)] small:text-lg">
            We are the regional Spectrum Camera distributor. You buy, quote, and
            support classified-area CCTV through Supercore — live GBP / EUR / USD
            pricing, variant SKUs, and project documentation for oil, gas,
            chemical, marine, and pharmaceutical sites.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/90">
            <li className="flex gap-2">
              <span className="text-sc-cta">—</span>
              Local commercial cover: quote-to-order, trade accounts, and SKU
              matching for Connectivity / Router / Region / Antenna options.
            </li>
            <li className="flex gap-2">
              <span className="text-sc-cta">—</span>
              Hazardous-area literacy: Class I Div 1 & 2, Zone 1 & 2, and
              certificate packs against the part number — not a generic PDF.
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocalizedClientLink href="/collections/spectrum" className="spc-cta">
              Shop the catalogue
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/brands/spectrum/certifications"
              className="spc-cta-ghost"
            >
              View certifications
            </LocalizedClientLink>
            <LocalizedClientLink href="/get-a-quote" className="spc-cta-ghost">
              Request a quote
            </LocalizedClientLink>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {HERO_IMAGES.map((image) => (
            <figure
              key={image.src}
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
      </div>
    </section>
  )
}

export default SpectrumHero
