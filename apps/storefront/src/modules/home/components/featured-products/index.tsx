import { HttpTypes } from "@medusajs/types"
import { isNavBrandHandle, sortCollectionsForStorefront } from "@lib/brands"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  const featured = sortCollectionsForStorefront(collections).filter((collection) =>
    isNavBrandHandle(collection.handle)
  )

  return featured.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} />
    </li>
  ))
}
