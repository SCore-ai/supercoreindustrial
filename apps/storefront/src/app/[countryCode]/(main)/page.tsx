import { Metadata } from "next"

import AboutBlock from "@modules/home/components/about-block"
import CtaBanner from "@modules/home/components/cta-banner"
import FeaturedCategories from "@modules/home/components/featured-categories"
import FeaturedProducts from "@modules/home/components/featured-products"
import HeroCarousel from "@modules/home/components/hero-carousel"
import QuickLinks from "@modules/home/components/quick-links"
import ResourcesGrid from "@modules/home/components/resources-grid"
import ServicesGrid from "@modules/home/components/services-grid"
import { listCollections } from "@lib/data/collections"
import { fetchOnlineStoreSettings } from "@lib/data/online-store"
import { FEATURED_CATEGORY_TILES, HERO_SLIDES } from "@lib/home-content"
import { getRegion } from "@lib/data/regions"
import { BRAND } from "@lib/brand"

export const metadata: Metadata = {
  title: {
    absolute: BRAND.legalName,
  },
  description: BRAND.description,
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [region, onlineStoreResult, collectionsResult] = await Promise.all([
    getRegion(countryCode),
    fetchOnlineStoreSettings(),
    listCollections({ fields: "id, handle, title" }),
  ])

  const { collections } = collectionsResult
  const homepage = onlineStoreResult.settings?.homepage

  const heroSlides =
    homepage?.heroSlides?.length ? homepage.heroSlides : HERO_SLIDES
  const featuredCategories =
    homepage?.featuredCategories?.length
      ? homepage.featuredCategories
      : FEATURED_CATEGORY_TILES

  if (!region) {
    return null
  }

  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <QuickLinks />
      <ServicesGrid />
      <FeaturedCategories categories={featuredCategories} />
      <ResourcesGrid />
      <AboutBlock />
      {!!collections?.length && (
        <div className="bg-white">
          <ul className="flex flex-col">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        </div>
      )}
      <CtaBanner />
    </>
  )
}
