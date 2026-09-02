import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FACTS = [
  {
    label: "Area classification",
    value: "Class I Div 1 & 2 · Zone 1 / 21 & Zone 2",
  },
  {
    label: "Typical groups",
    value: "B, C, D · IIB+H2 / IIIC (model-specific)",
  },
  {
    label: "Enclosure",
    value: "IP66 / IP67 · Type 4X · marine 316L options",
  },
  {
    label: "Connectivity",
    value: "PoE · fibre / SFP · 4G / 5G wireless",
  },
  {
    label: "Imaging cores",
    value: "Axis and partner optics in certified housings",
  },
  {
    label: "Origin",
    value: "Designed and manufactured in Houston, USA",
  },
]

const SpectrumTechFacts = () => {
  return (
    <section className="content-container pb-16">
      <div className="mb-6 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            Technical snapshot
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            What engineers ask before they specify
          </h2>
        </div>
        <LocalizedClientLink
          href="/brands/spectrum/certifications"
          className="text-sm font-medium text-sc-cta hover:text-white"
        >
          Full certification map →
        </LocalizedClientLink>
      </div>
      <dl className="grid gap-3 small:grid-cols-2 medium:grid-cols-3">
        {FACTS.map((fact) => (
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

export default SpectrumTechFacts
