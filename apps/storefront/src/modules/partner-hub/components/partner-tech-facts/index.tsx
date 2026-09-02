import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { PartnerBrandConfig } from "@lib/partner-brands/types"

const PartnerTechFacts = ({ config }: { config: PartnerBrandConfig }) => {
  return (
    <section className="content-container pb-16">
      <div className="mb-6 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            {config.techFacts.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            {config.techFacts.title}
          </h2>
        </div>
        <LocalizedClientLink
          href={`${config.hubHref}/certifications`}
          className="text-sm font-medium text-sc-cta hover:text-white"
        >
          Full certification map →
        </LocalizedClientLink>
      </div>
      <dl className="grid gap-3 small:grid-cols-2 medium:grid-cols-3">
        {config.techFacts.items.map((fact) => (
          <div
            key={fact.label}
            className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] px-5 py-5"
          >
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
              {fact.label}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-white">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default PartnerTechFacts
