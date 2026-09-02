import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CtaBanner = () => {
  return (
    <section className="bg-sc-ink text-white">
      <div className="content-container py-16 small:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="sc-section-heading text-white">
            Not sure where to start?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Connect with our experts to find the right solution for your wired and wireless networking needs.
          </p>
          <LocalizedClientLink
            href="/contact-us"
            className="mt-8 inline-flex items-center rounded-md bg-sc-cta px-6 py-3 text-base font-semibold text-sc-body transition-colors hover:bg-sc-cta-hover"
          >
            Connect With Us
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default CtaBanner
