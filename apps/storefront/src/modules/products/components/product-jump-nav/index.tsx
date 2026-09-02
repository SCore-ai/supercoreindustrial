"use client"

import { clx } from "@modules/common/components/ui"
import { useEffect, useRef, useState } from "react"

export type ProductJumpSection = {
  id: string
  label: string
}

type ProductJumpNavProps = {
  sections: ProductJumpSection[]
}

const ProductJumpNav = ({ sections }: ProductJumpNavProps) => {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "")
  const observerRefs = useRef<IntersectionObserver[]>([])

  useEffect(() => {
    observerRefs.current.forEach((o) => o.disconnect())
    observerRefs.current = []

    sections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(section.id)
          }
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
      )

      observer.observe(element)
      observerRefs.current.push(observer)
    })

    return () => observerRefs.current.forEach((o) => o.disconnect())
  }, [sections])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
    setActiveId(id)
  }

  if (!sections.length) {
    return null
  }

  return (
    <nav
      aria-label="Jump to section"
      className="border-b border-sc-line bg-white"
    >
      <div className="content-container flex flex-wrap items-center gap-x-1 gap-y-2 py-3 text-[15px]">
        <span className="mr-2 font-display font-semibold text-sc-steel">Jump to:</span>
        {sections.map((section, index) => (
          <span key={section.id} className="inline-flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-1 text-sc-line">
                |
              </span>
            )}
            <button
              type="button"
              onClick={() => scrollTo(section.id)}
              className={clx(
                "font-display font-semibold transition-colors hover:text-sc-cta",
                activeId === section.id
                  ? "text-sc-ink underline decoration-sc-cta decoration-2 underline-offset-4"
                  : "text-sc-body"
              )}
            >
              {section.label}
            </button>
          </span>
        ))}
      </div>
    </nav>
  )
}

export default ProductJumpNav
