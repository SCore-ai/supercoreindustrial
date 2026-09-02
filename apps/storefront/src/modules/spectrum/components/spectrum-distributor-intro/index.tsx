const PILLARS = [
  {
    title: "Your regional desk",
    body: "Supercore prices, quotes, and supports Spectrum in this territory. One commercial path from SKU to site — not a US web cart with a freight surprise.",
  },
  {
    title: "Live multi-currency catalogue",
    body: "Manufacturer USD list converted to GBP store base with EUR and USD on every variant. Trade accounts see quote flow; checkout remains where terms allow.",
  },
  {
    title: "Configured assemblies",
    body: "D-Series and F-Series SKUs include Connectivity, Router, Region, and Antenna options. We match the certified assembly, not a bare camera core.",
  },
]

const SpectrumDistributorIntro = () => {
  return (
    <section className="content-container pb-12">
      <div className="grid gap-4 small:grid-cols-3">
        {PILLARS.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] p-6"
          >
            <h2 className="font-display text-xl text-white">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--spc-muted)]">
              {pillar.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SpectrumDistributorIntro
