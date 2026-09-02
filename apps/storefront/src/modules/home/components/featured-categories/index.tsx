import Image from "next/image"

import type { StoreHomepageFeaturedCategory } from "@lib/data/online-store"
import { FEATURED_CATEGORY_TILES } from "@lib/home-content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type FeaturedCategoriesProps = {
  categories?: StoreHomepageFeaturedCategory[]
}

const FeaturedCategories = ({
  categories = FEATURED_CATEGORY_TILES,
}: FeaturedCategoriesProps) => {
  const tiles = categories.length ? categories : FEATURED_CATEGORY_TILES

  return (
    <section className="bg-sc-paper">
      <div className="content-container py-16 small:py-20">
        <div className="flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
          <h2 className="sc-section-heading">
            Featured Categories
          </h2>
          <LocalizedClientLink
            href="/all-products"
            className="text-base font-semibold text-sc-body hover:text-sc-cta transition-colors"
          >
            Explore Full Product Catalog →
          </LocalizedClientLink>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 small:grid-cols-4 small:gap-6">
          {tiles.map((category) => (
            <li key={category.handle}>
              <LocalizedClientLink
                href={
                  category.href ?? `/all-products/${category.handle}`
                }
                className="group flex flex-col items-center rounded-lg border border-sc-line bg-white p-6 text-center transition-shadow hover:shadow-md"
              >
                <div className="relative mb-5 h-28 w-full">
                  <Image
                    src={category.image}
                    alt={category.imageAlt}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <span className="text-base font-normal text-sc-body">
                  {category.title}
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default FeaturedCategories
