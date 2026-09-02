import LocalizedClientLink from "@modules/common/components/localized-client-link"

type SpectrumSeriesHeroProps = {
  eyebrow: string
  title: string
  description: string
}

const SpectrumSeriesHero = ({
  eyebrow,
  title,
  description,
}: SpectrumSeriesHeroProps) => {
  return (
    <header className="content-container py-12 small:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sc-cta">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--spc-muted)]">
        {description}
      </p>
      <LocalizedClientLink
        href="/brands/spectrum"
        className="mt-6 inline-flex text-sm text-white hover:text-sc-cta"
      >
        ← All Spectrum series
      </LocalizedClientLink>
    </header>
  )
}

export default SpectrumSeriesHero
