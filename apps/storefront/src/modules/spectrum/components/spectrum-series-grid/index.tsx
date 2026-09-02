import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { SpectrumSeries } from "@lib/spectrum/series"

export type SpectrumSeriesTile = {
  series: SpectrumSeries
  count: number
  image: string | null
}

const SpectrumSeriesGrid = ({ tiles }: { tiles: SpectrumSeriesTile[] }) => {
  return (
    <section className="content-container pb-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            Select series
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            Certified cameras and hardware
          </h2>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-4 small:grid-cols-2 large:grid-cols-3">
        {tiles.map(({ series, count, image }) => (
          <li key={series.slug}>
            <LocalizedClientLink
              href={series.href}
              className="group block overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)]"
            >
              <div className="relative aspect-[5/3] bg-[var(--spc-elevated)]">
                {image ? (
                  <Image
                    src={image}
                    alt={series.title}
                    fill
                    className="object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.16em] text-[var(--spc-muted)]">
                    {series.navLabel}
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--spc-line)] p-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-sc-cta">
                  {series.eyebrow}
                </p>
                <h3 className="mt-1 font-display text-xl text-white">
                  {series.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--spc-muted)]">
                  {series.description}
                </p>
                <p className="mt-4 text-sm font-medium text-white">
                  Explore {series.navLabel}
                  {count > 0 ? ` · ${count}` : ""}
                  <span className="ml-1 text-sc-cta">→</span>
                </p>
              </div>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default SpectrumSeriesGrid
