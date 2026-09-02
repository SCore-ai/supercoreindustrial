"use client"

import {
  getProductSections,
  type ProductPageContent,
} from "@lib/util/product-page-content"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { useEffect, useMemo, useRef, useState } from "react"

type ProductContentProps = {
  product: HttpTypes.StoreProduct
  content: ProductPageContent
  matrixMode?: boolean
}

const ProductContent = ({
  product,
  content,
  matrixMode = false,
}: ProductContentProps) => {
  const sections = useMemo(
    () => getProductSections(content, { matrixMode }),
    [content, matrixMode]
  )
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "description")
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach((section) => {
      const element = sectionRefs.current[section.id]
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(section.id)
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => observers.forEach((observer) => observer.disconnect())
  }, [sections])

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    setActiveId(id)
  }

  return (
    <div className="border-t border-sc-line bg-white">
      <div className="sticky top-[var(--sc-header-height)] z-30 hidden border-b border-sc-line bg-white/95 backdrop-blur-sm small:block">
        <div className="content-container">
          <nav
            aria-label="Product sections"
            className="flex gap-1 overflow-x-auto no-scrollbar py-3"
          >
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollTo(section.id)}
                className={clx(
                  "shrink-0 px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors",
                  activeId === section.id
                    ? "border-b-2 border-sc-cta text-sc-ink"
                    : "text-sc-steel hover:text-sc-body"
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="content-container space-y-14 py-10 small:space-y-16 small:py-14">
        <section
          id="description"
          ref={(el) => {
            sectionRefs.current.description = el
          }}
          className="scroll-mt-36"
        >
          <SectionHeading>Details</SectionHeading>
          <div className="prose-sc mt-6 max-w-4xl text-sc-body">
            {product.description ? (
              <p className="whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-sc-steel">
                Detailed product description will be available soon. Contact our
                team for specification assistance.
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-sc-steel">
            Pricing and availability restrictions may apply — contact us for
            project-level terms.
          </p>

          {content.videoUrl && (
            <div className="mt-8 aspect-video max-w-3xl overflow-hidden rounded-lg border border-sc-line bg-sc-paper">
              <iframe
                src={content.videoUrl}
                title={`${product.title} product video`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </section>

        {content.features.length > 0 && (
          <section
            id="features"
            ref={(el) => {
              sectionRefs.current.features = el
            }}
            className="scroll-mt-36"
          >
            <SectionHeading>Key features</SectionHeading>
            <ul className="mt-6 grid gap-3 medium:grid-cols-2">
              {content.features.map((feature) => (
                <li
                  key={feature}
                  className="flex gap-3 border border-sc-line bg-sc-paper/50 px-4 py-3 text-sm text-sc-body"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sc-cta"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}

        {content.specGroups.length > 0 && (
          <section
            id="specifications"
            ref={(el) => {
              sectionRefs.current.specifications = el
            }}
            className="scroll-mt-36"
          >
            <SectionHeading>Specifications</SectionHeading>
            <div className="mt-6 space-y-8">
              {content.specGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-sc-steel">
                    {group.title}
                  </h3>
                  <div className="overflow-hidden border border-sc-line">
                    <table className="w-full text-sm">
                      <tbody>
                        {group.rows.map((row, index) => (
                          <tr
                            key={`${row.label}-${row.value}`}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-sc-paper/70"
                            }
                          >
                            <th
                              scope="row"
                              className="w-2/5 border-r border-sc-line px-4 py-3 text-left font-semibold text-sc-steel"
                            >
                              {row.label}
                            </th>
                            <td className="px-4 py-3 text-sc-body">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.documents.length > 0 && (
          <section
            id="documents"
            ref={(el) => {
              sectionRefs.current.documents = el
            }}
            className="scroll-mt-36"
          >
            <SectionHeading>Documentation</SectionHeading>
            <div className="mt-6 overflow-hidden border border-sc-line">
              <table className="w-full text-sm">
                <thead className="border-b border-sc-line bg-sc-paper text-left text-xs font-bold uppercase tracking-wider text-sc-steel">
                  <tr>
                    <th className="px-4 py-3">Document</th>
                    <th className="hidden px-4 py-3 small:table-cell">Type</th>
                    <th className="px-4 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {content.documents.map((doc) => (
                    <tr key={doc.url} className="border-t border-sc-line">
                      <td className="px-4 py-3 font-medium text-sc-body">
                        {doc.name}
                      </td>
                      <td className="hidden px-4 py-3 uppercase text-sc-steel small:table-cell">
                        {doc.type ?? "PDF"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-sc-body hover:text-sc-cta"
                        >
                          Download pdf
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section
          id="shipping"
          ref={(el) => {
            sectionRefs.current.shipping = el
          }}
          className="scroll-mt-36"
        >
          <SectionHeading>Support &amp; delivery</SectionHeading>
          <div className="mt-6 grid gap-6 medium:grid-cols-2">
            <div className="border border-sc-line bg-sc-paper/50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-sc-steel">
                Lead times
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-sc-body">
                {content.shippingNotes}
              </p>
            </div>
            <div className="border border-sc-line bg-sc-paper/50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-sc-steel">
                Engineering support
              </h3>
              <p className="mt-3 text-sm text-sc-body">
                Front-end engineering, configuration, and commissioning support
                available for industrial deployments.
              </p>
              <LocalizedClientLink
                href="/contact-us"
                className="mt-4 inline-flex text-sm font-bold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
              >
                Learn more
              </LocalizedClientLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-sc-line pb-3 font-display text-2xl font-bold text-sc-ink">
      {children}
    </h2>
  )
}

export default ProductContent
