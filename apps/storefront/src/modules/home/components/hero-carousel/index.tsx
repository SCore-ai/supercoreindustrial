"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import type { StoreHomepageHeroSlide } from "@lib/data/online-store"
import { HERO_SLIDES } from "@lib/home-content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SLIDE_INTERVAL_MS = 8000

type HeroCarouselProps = {
  slides?: StoreHomepageHeroSlide[]
}

const HeroCarousel = ({ slides = HERO_SLIDES }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const slideList = slides.length ? slides : HERO_SLIDES

  useEffect(() => {
    if (!slideList.length) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideList.length)
    }, SLIDE_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [slideList.length])

  const activeSlide = slideList[activeIndex]

  if (!activeSlide) {
    return null
  }

  return (
    <section className="relative isolate w-full overflow-hidden bg-sc-ink text-white">
      <div className="relative min-h-[520px] small:min-h-[620px]">
        {slideList.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-sc-ink/90 via-sc-ink/70 to-sc-ink/30" />
          </div>
        ))}

        <div className="content-container relative z-10 flex min-h-[520px] flex-col justify-center py-16 small:min-h-[620px] small:py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sc-cta">
            {activeSlide.tag}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight small:text-5xl">
            {activeSlide.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90">
            {activeSlide.description}
          </p>
          <div className="mt-8">
            <LocalizedClientLink
              href={activeSlide.ctaHref}
              className="inline-flex items-center rounded-md bg-sc-cta px-6 py-3 text-base font-semibold text-sc-ink transition hover:bg-sc-cta-hover"
            >
              {activeSlide.ctaLabel}
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {slideList.length > 1 && (
        <div className="border-t border-white/10 bg-sc-ink/95">
          <div className="content-container">
            <ul className="flex overflow-x-auto">
              {slideList.map((slide, index) => (
                <li key={slide.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors small:px-6 ${
                      index === activeIndex
                        ? "border-sc-cta text-sc-cta"
                        : "border-transparent text-white/70 hover:text-white"
                    }`}
                  >
                    {slide.tabLabel}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

export default HeroCarousel
