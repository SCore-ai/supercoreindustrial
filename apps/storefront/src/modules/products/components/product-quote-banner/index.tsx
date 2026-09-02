import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductQuoteBannerProps = {
  productTitle: string
}

const ProductQuoteBanner = ({ productTitle }: ProductQuoteBannerProps) => (
  <section
    id="request-quote"
    className="scroll-mt-36 border-t border-sc-line bg-sc-ink text-white"
  >
    <div className="content-container grid gap-8 py-12 small:grid-cols-[1fr_auto] small:items-center small:py-16">
      <div>
        <h2 className="font-display text-2xl font-semibold">Request a quote</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-sc-mist">
          Need pricing for {productTitle} or multiple line items? Our sales
          engineers respond quickly with lead times, compliance documentation,
          and project-level discounts.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <LocalizedClientLink
          href="/quote"
          className="inline-flex items-center justify-center rounded-md bg-sc-cta px-6 py-3 text-sm font-semibold text-sc-ink transition-colors hover:bg-sc-cta-hover"
        >
          Request quote
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/contact-us"
          className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-sc-cta hover:text-sc-cta"
        >
          Contact sales
        </LocalizedClientLink>
      </div>
    </div>
  </section>
)

export default ProductQuoteBanner
