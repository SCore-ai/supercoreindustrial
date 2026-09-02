import Image from "next/image"

import { ABOUT_COPY, ABOUT_IMAGE } from "@lib/home-content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const AboutBlock = () => {
  return (
    <section className="bg-sc-paper">
      <div className="content-container py-16 small:py-20">
        <div className="grid grid-cols-1 items-center gap-10 small:grid-cols-2 small:gap-16">
          <div>
            <h2 className="sc-section-heading">
              About Supercore
            </h2>
            <p className="mt-6 text-base leading-relaxed text-sc-steel">
              {ABOUT_COPY}
            </p>
            <LocalizedClientLink
              href="/store"
              className="mt-8 inline-flex items-center rounded-md bg-sc-cta px-6 py-3 text-base font-semibold text-sc-body transition-colors hover:bg-sc-cta-hover"
            >
              Get to Know Supercore
            </LocalizedClientLink>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={ABOUT_IMAGE}
              alt="Industrial team reviewing site connectivity plans"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBlock
