import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CERTS = [
  { mark: "cFMus", note: "NEC / CEC" },
  { mark: "ATEX", note: "EU Zone 1/2" },
  { mark: "IECEx", note: "Global" },
  { mark: "INMETRO", note: "Brazil" },
  { mark: "PESO", note: "India" },
  { mark: "UKCA", note: "United Kingdom" },
]

const SpectrumCertsStrip = () => {
  return (
    <section className="content-container pb-16">
      <LocalizedClientLink
        href="/brands/spectrum/certifications"
        className="block overflow-hidden rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] transition-colors hover:border-sc-cta"
      >
        <div className="flex flex-col gap-6 px-6 py-7 small:flex-row small:items-center small:justify-between">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
              Independently certified
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight text-white">
              Global Ex marks — we issue the pack against your SKU
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--spc-muted)]">
              FM, ATEX, IECEx, INMETRO, PESO and UKCA coverage varies by
              assembly. Open the certification map or request the datasheet for
              the exact part number.
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-2 small:min-w-[280px]">
            {CERTS.map((cert) => (
              <li
                key={cert.mark}
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

export default SpectrumCertsStrip
