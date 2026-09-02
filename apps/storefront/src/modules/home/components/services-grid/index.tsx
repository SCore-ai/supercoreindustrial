import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  CONNECTIVITY_TECHNOLOGY_CARDS,
  CORE_SERVICE_CARDS,
} from "@lib/home-content"

const ServiceCardGrid = ({
  items,
}: {
  items: typeof CORE_SERVICE_CARDS
}) => (
  <ul className="grid grid-cols-1 gap-6 small:grid-cols-2">
    {items.map((service) => (
      <li key={service.title}>
        <LocalizedClientLink
          href={service.href}
          className="group flex h-full flex-col rounded-lg border border-sc-line bg-sc-paper p-8 transition-colors hover:border-sc-cta/40 hover:bg-white"
        >
          <h3 className="text-xl leading-7 font-normal tracking-tight text-sc-ink">
            {service.title}
          </h3>
          <p className="mt-4 flex-1 text-base leading-relaxed text-sc-steel">
            {service.description}
          </p>
          <span className="mt-6 inline-flex items-center text-base font-semibold text-sc-body transition-colors group-hover:text-sc-cta group-hover:translate-x-0.5">
            {service.ctaLabel} →
          </span>
        </LocalizedClientLink>
      </li>
    ))}
  </ul>
)

const ServicesGrid = () => {
  return (
    <section className="bg-white">
      <div className="content-container py-16 small:py-20">
        <h2 className="sc-section-heading">
          Our Services and Technologies
        </h2>

        <div className="mt-12">
          <h3 className="text-xl leading-7 font-normal tracking-tight text-sc-body">
            Core Systems
          </h3>
          <div className="mt-6">
            <ServiceCardGrid items={CORE_SERVICE_CARDS} />
          </div>
        </div>

        <div className="mt-14">
          <h3 className="text-xl leading-7 font-normal tracking-tight text-sc-body">
            Connectivity & Managed Services
          </h3>
          <div className="mt-6">
            <ServiceCardGrid items={CONNECTIVITY_TECHNOLOGY_CARDS} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesGrid
