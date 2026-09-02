import type { PartnerBrandConfig } from "@lib/partner-brands/types"

const PartnerIntro = ({ config }: { config: PartnerBrandConfig }) => {
  return (
    <section className="content-container pb-12">
      <div className="grid gap-4 small:grid-cols-3">
        {config.intro.map((pillar) => (
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

export default PartnerIntro
