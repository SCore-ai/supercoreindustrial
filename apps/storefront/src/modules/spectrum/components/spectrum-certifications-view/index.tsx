import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  SPECTRUM_CERT_SCHEMES,
  SPECTRUM_CLASS_MAP,
  SPECTRUM_SUBMITTAL_STEPS,
  SPECTRUM_TYPICAL_MARKING,
} from "@lib/spectrum/certifications"

const SpectrumCertificationsView = () => {
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
            Compliance · regional distributor
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-white small:text-5xl">
            Certification map for Spectrum through Supercore
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--spc-muted)]">
            Marks are issued to the certified assembly, not the website. We
            translate Class/Division and Zone language, lock the variant SKU,
            and send the matching certificate set for your submittal.
          </p>
          <nav
            className="mt-8 flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em]"
            aria-label="On this page"
          >
            <a href="#schemes" className="text-white hover:text-sc-cta">
              Schemes
            </a>
            <a href="#translator" className="text-white hover:text-sc-cta">
              Div ↔ Zone
            </a>
            <a href="#marking" className="text-white hover:text-sc-cta">
              Typical marking
            </a>
            <a href="#submittal" className="text-white hover:text-sc-cta">
              Submittal pack
            </a>
          </nav>
        </div>
      </header>

      <section className="content-container py-10">
        <ul className="grid gap-4 small:grid-cols-3">
          {[
            {
              title: "We read the drawing",
              body: "Class/Division or Zone, groups, and T-class from your hazardous-area package — then we map it to the Spectrum listing.",
            },
            {
              title: "We lock the assembly",
              body: "Connectivity, router, region, and antenna options are part of the certified SKU. Changing them can change the cert set.",
            },
            {
              title: "We issue the pack",
              body: "Datasheet plus the matching FM / ATEX / IECEx (and national) files for that part number — ready for EPC submittal.",
            },
          ].map((item) => (
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

      <section id="schemes" className="content-container scroll-mt-36 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
          Independent schemes
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
          Where the same camera is accepted
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
          Coverage is model-specific. Use this as a specifier map, then confirm
          the certificate number on the datasheet for that SKU.
        </p>
        <ul className="mt-8 grid gap-4 small:grid-cols-2 medium:grid-cols-3">
          {SPECTRUM_CERT_SCHEMES.map((scheme) => (
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
        id="translator"
        className="scroll-mt-36 border-y border-[var(--spc-line)] bg-[var(--spc-surface)]"
      >
        <div className="content-container py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            Classification translator
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            NEC / CEC language next to IEC Zones
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--spc-muted)]">
            North American drawings speak Division. European and IECEx packages
            speak Zone. Spectrum assemblies are typically dual-listed so one
            housing can land on either drawing — still confirm groups and T-class.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparison of NEC Class Division ratings with IEC Zones
              </caption>
              <thead>
                <tr className="border-b border-[var(--spc-line)] text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
                  <th className="py-3 pr-4 font-medium">North America</th>
                  <th className="py-3 pr-4 font-medium">IEC / ATEX</th>
                  <th className="py-3 font-medium">What it means on site</th>
                </tr>
              </thead>
              <tbody>
                {SPECTRUM_CLASS_MAP.map((row) => (
                  <tr
                    key={row.nec}
                    className="border-b border-[var(--spc-line)] text-white"
                  >
                    <td className="py-4 pr-4 align-top font-medium">{row.nec}</td>
                    <td className="py-4 pr-4 align-top text-[var(--spc-muted)]">
                      {row.iec}
                    </td>
                    <td className="py-4 align-top text-[var(--spc-muted)]">
                      {row.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="marking" className="content-container scroll-mt-36 py-14">
        <div className="grid gap-8 small:grid-cols-[1.1fr_0.9fr] small:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              Nameplate literacy
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
              How a typical Spectrum marking reads
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--spc-muted)]">
              Example string from a D-Series family datasheet. Ambient range,
              T-class, and certificate numbers change by model. Never copy this
              block onto a submittal without the SKU sheet.
            </p>
            <dl className="mt-6 space-y-4">
              {SPECTRUM_TYPICAL_MARKING.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-[var(--spc-line)] pb-4"
                >
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[var(--spc-muted)]">
                    {row.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="rounded-lg border border-sc-cta/40 bg-[var(--spc-elevated)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sc-cta">
              Distributor note
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Wireless, media-converter, and antenna variants are part of the
              certified assembly. Changing Connectivity or Router on the PDP
              can change the certificate set we send.
            </p>
            <LocalizedClientLink
              href="/brands/spectrum"
              className="mt-5 inline-flex text-sm font-medium text-sc-cta hover:text-white"
            >
              Back to Spectrum shop →
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
            How we work a package
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-white">
            Three steps to a usable cert pack
          </h2>
          <ol className="mt-8 grid gap-4 small:grid-cols-3">
            {SPECTRUM_SUBMITTAL_STEPS.map((item) => (
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

export default SpectrumCertificationsView
