import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { PartnerBrandConfig } from "@lib/partner-brands/types"

const PartnerCertificationsView = ({
  config,
}: {
  config: PartnerBrandConfig
}) => {
  const page = config.certifications

  return (
    <>
      <header className="relative overflow-hidden border-b border-[var(--spc-line)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative content-container py-14 small:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sc-cta">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-white small:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--spc-muted)]">
            {page.body}
          </p>
          <nav
            className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em]"
            aria-label="On this page"
          >
            {page.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-white hover:text-sc-cta"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="content-container py-10">
        <ul className="grid gap-4 small:grid-cols-3">
          {page.help.map((item) => (
            <li
              key={item.title}
              className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] p-5"
            >
              <h2 className="font-display text-lg text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--spc-muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="mandates" className="content-container scroll-mt-36 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
          {page.schemesEyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
          {page.schemesTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
          {page.schemesBody}
        </p>
        <ul className="mt-8 grid gap-4 small:grid-cols-2 medium:grid-cols-3">
          {page.schemes.map((scheme) => (
            <li
              key={scheme.id}
              className="flex flex-col rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] p-5"
            >
              <p className="font-display text-2xl text-white">{scheme.mark}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-sc-cta">
                {scheme.region}
              </p>
              <p className="mt-3 text-xs font-medium text-white/80">
                {scheme.role}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--spc-muted)]">
                {scheme.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="families"
        className="scroll-mt-36 border-y border-[var(--spc-line)] bg-[var(--spc-surface)]"
      >
        <div className="content-container py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            {page.translatorEyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            {page.translatorTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
            {page.translatorBody}
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">{page.translatorTitle}</caption>
              <thead>
                <tr className="border-b border-[var(--spc-line)] text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
                  {page.translatorHeaders.map((header) => (
                    <th key={header} className="py-3 pr-4 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.translatorRows.map((row) => (
                  <tr
                    key={row.left}
                    className="border-b border-[var(--spc-line)] text-white"
                  >
                    <td className="py-4 pr-4 align-top font-medium">
                      {row.left}
                    </td>
                    <td className="py-4 pr-4 align-top text-[var(--spc-muted)]">
                      {row.mid}
                    </td>
                    <td className="py-4 align-top text-[var(--spc-muted)]">
                      {row.right}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="sites" className="content-container scroll-mt-36 py-14">
        <div className="grid gap-8 small:grid-cols-[1.1fr_0.9fr] small:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              {page.markingEyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
              {page.markingTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--spc-muted)]">
              {page.markingBody}
            </p>
            <dl className="mt-6 space-y-4">
              {page.marking.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-[var(--spc-line)] pb-4"
                >
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-white">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="rounded-lg border border-sc-cta/40 bg-[var(--spc-elevated)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sc-cta">
              {page.noteTitle}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              {page.noteBody}
            </p>
            <LocalizedClientLink
              href={config.hubHref}
              className="mt-5 inline-flex text-sm font-medium text-sc-cta hover:text-white"
            >
              Back to {config.label} shop →
            </LocalizedClientLink>
          </aside>
        </div>
      </section>

      <section
        id="submittal"
        className="scroll-mt-36 border-t border-[var(--spc-line)] bg-[var(--spc-surface)]"
      >
        <div className="content-container py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            {page.stepsEyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            {page.stepsTitle}
          </h2>
          <ol className="mt-8 grid gap-4 small:grid-cols-3">
            {page.steps.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-[var(--spc-line)] bg-[var(--spc-bg)] p-6"
              >
                <p className="font-mono text-sm text-sc-cta">{item.step}</p>
                <h3 className="mt-3 font-display text-xl text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--spc-muted)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <LocalizedClientLink href="/get-a-quote" className="spc-cta">
              Request cert pack / quote
            </LocalizedClientLink>
            <LocalizedClientLink href="/contact-us" className="spc-cta-ghost">
              Talk to sales
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </>
  )
}

export default PartnerCertificationsView
