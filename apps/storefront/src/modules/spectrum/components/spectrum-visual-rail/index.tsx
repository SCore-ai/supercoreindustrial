import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SHOTS = [
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/07/TEZP-405-V02.png",
    alt: "Spectrum TEZP 316L stainless PTZ camera",
    href: "/brands/spectrum/tezp-fezb",
    label: "316L marine",
    title: "Offshore and corrosive atmospheres",
  },
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/07/zone-five-div1-xr60-hpoe8.png",
    alt: "Spectrum classified-area junction box",
    href: "/brands/spectrum/junction-boxes",
    label: "Junction boxes",
    title: "Certified termination in the zone",
  },
  {
    src: "https://explosionproofcamera.com/wp-content/uploads/2026/07/scs-hcs9021q-sfp-bt-c1d2.png",
    alt: "Spectrum industrial PoE and fibre network accessory",
    href: "/brands/spectrum/network-accessories",
    label: "Network",
    title: "PoE, fibre, and remote links",
  },
]

const SpectrumVisualRail = () => {
  return (
    <section className="content-container pb-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            Hardware in the field
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            Built for ignition zones, sold through us
          </h2>
        </div>
      </div>
      <ul className="grid gap-4 small:grid-cols-3">
        {SHOTS.map((shot) => (
          <li key={shot.href}>
            <LocalizedClientLink
              href={shot.href}
              className="group block overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)]"
            >
              <div className="relative aspect-[5/4] bg-[var(--spc-elevated)]">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <div className="border-t border-[var(--spc-line)] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-sc-cta">
                  {shot.label}
                </p>
                <p className="mt-1 font-display text-lg text-white">
                  {shot.title}
                </p>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default SpectrumVisualRail
