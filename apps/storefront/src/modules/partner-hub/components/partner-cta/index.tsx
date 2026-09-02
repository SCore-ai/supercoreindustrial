import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { PartnerBrandConfig } from "@lib/partner-brands/types"

const PartnerCta = ({ config }: { config: PartnerBrandConfig }) => {
  return (
    <section className="content-container py-16">
      <div
        className="rounded-lg px-8 py-10 text-center small:px-12"
        style={{ background: "var(--spc-surface)" }}
      >
        <h2 className="font-display text-3xl tracking-tight text-white">
          {config.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
          {config.cta.body}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LocalizedClientLink href="/get-a-quote" className="spc-cta">
            Request a quote
          </LocalizedClientLink>
          <LocalizedClientLink href="/contact-us" className="spc-cta-ghost">
            Contact sales
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default PartnerCta
