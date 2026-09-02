import Image from "next/image"

import type { PageSection } from "@lib/site-pages"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import ContactForm from "../contact-form"
import PartnerPrograms from "../partner-programs"

type PageSectionsProps = {
  sections: PageSection[]
}

const PageSections = ({ sections }: PageSectionsProps) => {
  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case "intro":
            return (
              <section key={index} className="bg-white">
                <div className="content-container py-12 small:py-16">
                  {section.heading && (
                    <h2 className="font-display text-3xl tracking-tight text-sc-ink">
                      {section.heading}
                    </h2>
                  )}
                  <p
                    className={`max-w-4xl text-base leading-relaxed text-sc-steel ${
                      section.heading ? "mt-4" : ""
                    }`}
                  >
                    {section.body}
                  </p>
                </div>
              </section>
            )

          case "values":
            return (
              <section key={index} className="bg-sc-paper">
                <div className="content-container py-12 small:py-16">
                  {section.heading && (
                    <h2 className="font-display text-3xl tracking-tight text-sc-ink">
                      {section.heading}
                    </h2>
                  )}
                  <ul className="mt-8 grid grid-cols-1 gap-6 small:grid-cols-3">
                    {section.items.map((item) => (
                      <li
                        key={item.title}
                        className="rounded-lg border border-sc-line bg-white p-6"
                      >
                        <h3 className="text-lg font-semibold text-sc-ink">{item.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-sc-steel">
                          {item.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )

          case "cards":
            return (
              <section key={index} className="bg-white">
                <div className="content-container py-12 small:py-16">
                  {section.heading && (
                    <h2 className="font-display text-3xl tracking-tight text-sc-ink">
                      {section.heading}
                    </h2>
                  )}
                  <ul
                    className={`grid grid-cols-1 gap-6 small:grid-cols-2 ${
                      section.heading ? "mt-8" : ""
                    }`}
                  >
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <LocalizedClientLink
                          href={item.href}
                          className="group flex h-full flex-col rounded-lg border border-sc-line bg-sc-paper p-6 transition-colors hover:border-sc-cta/40 hover:bg-white"
                        >
                          <h3 className="text-xl font-semibold text-sc-ink">{item.title}</h3>
                          {item.description && (
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-sc-steel">
                              {item.description}
                            </p>
                          )}
                          <span className="mt-5 text-sm font-semibold text-sc-body group-hover:text-sc-cta">
                            {item.ctaLabel || "Learn More"} →
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )

          case "category-grid":
            return (
              <section key={index} className="bg-white">
                <div className="content-container py-12 small:py-16">
                  {section.heading && (
                    <h2 className="font-display text-3xl tracking-tight text-sc-ink">
                      {section.heading}
                    </h2>
                  )}
                  <ul
                    className={`grid grid-cols-2 gap-4 small:grid-cols-3 medium:grid-cols-4 ${
                      section.heading ? "mt-8" : ""
                    }`}
                  >
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <LocalizedClientLink
                          href={item.href}
                          className="group flex flex-col items-center rounded-lg border border-sc-line bg-white p-5 text-center transition-shadow hover:shadow-md"
                        >
                          {item.image && (
                            <div className="relative mb-4 h-24 w-full">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                                sizes="200px"
                              />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-sc-ink">{item.title}</span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )

          case "cta":
            return (
              <section key={index} className="bg-sc-ink text-white">
                <div className="content-container py-16 text-center">
                  <h2 className="font-display text-3xl tracking-tight">{section.heading}</h2>
                  {section.body && (
                    <p className="mx-auto mt-4 max-w-2xl text-white/75">{section.body}</p>
                  )}
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <LocalizedClientLink
                      href={section.primaryHref}
                      className="inline-flex rounded-md bg-sc-cta px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sc-ink hover:bg-sc-cta-hover"
                    >
                      {section.primaryLabel}
                    </LocalizedClientLink>
                    {section.secondaryLabel && section.secondaryHref && (
                      <LocalizedClientLink
                        href={section.secondaryHref}
                        className="inline-flex rounded-md border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-white/10"
                      >
                        {section.secondaryLabel}
                      </LocalizedClientLink>
                    )}
                  </div>
                </div>
              </section>
            )

          case "contact-info":
            return <ContactForm key={index} />

          case "partner-programs":
            return <PartnerPrograms key={index} />

          default:
            return null
        }
      })}
    </>
  )
}

export default PageSections
