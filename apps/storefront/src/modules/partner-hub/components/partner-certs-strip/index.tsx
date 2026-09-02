import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { PartnerBrandConfig } from "@lib/partner-brands/types"

const PartnerCertsStrip = ({ config }: { config: PartnerBrandConfig }) => {
  const strip = config.certsStrip

  return (
    <section className="content-container pb-16">
      <LocalizedClientLink
        href={`${config.hubHref}/certifications`}
        className="block overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] transition-colors hover:border-sc-cta"
      >
        <div className="flex flex-col gap-6 px-6 py-7 small:flex-row small:items-center small:justify-between">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              {strip.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight text-white">
              {strip.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--spc-muted)]">
              {strip.body}
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-2 small:min-w-[280px]">
            {strip.marks.map((cert) => (
              <li
                key={`${cert.mark}-${cert.note}`}
                className="rounded-md border border-[var(--spc-line)] px-2 py-2 text-center"
              >
                <p className="text-xs font-semibold tracking-wide text-white">
                  {cert.mark}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--spc-muted)]">
                  {cert.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </LocalizedClientLink>
    </section>
  )
}

export default PartnerCertsStrip
