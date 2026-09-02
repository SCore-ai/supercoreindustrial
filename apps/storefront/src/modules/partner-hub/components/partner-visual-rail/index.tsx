import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { PartnerBrandConfig } from "@lib/partner-brands/types"

type Shot = {
  src: string | null
  href: string
  label: string
  title: string
  alt: string
}

const PartnerVisualRail = ({
  config,
  shots,
}: {
  config: PartnerBrandConfig
  shots: Shot[]
}) => {
  return (
    <section className="content-container pb-14">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
          {config.visualRail.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
          {config.visualRail.title}
        </h2>
      </div>
      <ul className="grid gap-4 small:grid-cols-3">
        {shots.map((shot) => (
          <li key={shot.href}>
            <LocalizedClientLink
              href={shot.href}
              className="group block overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)]"
            >
              <div className="relative aspect-[5/4] bg-[var(--spc-elevated)]">
                {shot.src ? (
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.16em] text-[var(--spc-muted)]">
                    {shot.label}
                  </div>
                )}
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

export default PartnerVisualRail
