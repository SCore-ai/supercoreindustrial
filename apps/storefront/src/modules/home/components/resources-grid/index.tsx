import Image from "next/image"

import { RESOURCE_CARDS } from "@lib/home-content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ResourcesGrid = () => {
  return (
    <section className="bg-white">
      <div className="content-container py-16 small:py-20">
        <h2 className="sc-section-heading">
          Proven Results + Real-World Impact
        </h2>

        <ul className="mt-10 grid grid-cols-1 gap-6 small:grid-cols-3">
          {RESOURCE_CARDS.map((resource) => (
            <li key={resource.title}>
              <LocalizedClientLink
                href={resource.href}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-sc-line bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={resource.image}
                    alt={resource.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sc-steel">
                    {resource.tag}
                  </span>
                  <h3 className="mt-3 text-xl leading-7 font-normal text-sc-body">
                    {resource.title}
                  </h3>
                  <p className="mt-3 text-base text-sc-steel">{resource.date}</p>
                  <span className="mt-auto pt-5 text-base font-semibold text-sc-body transition-colors group-hover:text-sc-cta">
                    Read More →
                  </span>
                </div>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default ResourcesGrid
