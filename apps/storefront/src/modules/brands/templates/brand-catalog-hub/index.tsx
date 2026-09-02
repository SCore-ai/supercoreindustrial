import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import type { CatalogBrand } from "@lib/brands"

type BrandCatalogHubProps = {
  brand: CatalogBrand
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion | null
}

const BrandCatalogHub = ({
  brand,
  products,
  region,
}: BrandCatalogHubProps) => {
  return (
    <div className="bg-white">
      <section className="bg-sc-ink text-white">
        <div className="content-container py-16 small:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sc-cta">
            Shop by brand
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">
            {brand.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
            {brand.blurb}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LocalizedClientLink
              href={`/collections/${brand.collectionHandle}`}
              className="inline-flex rounded-md bg-sc-cta px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sc-ink hover:bg-sc-cta-hover"
            >
              View collection
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/get-a-quote"
              className="inline-flex rounded-md border border-white/30 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:border-sc-cta hover:text-sc-cta"
            >
              Request a quote
            </LocalizedClientLink>
          </div>
        </div>
      </section>

      <section className="content-container py-14">
        {region && products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-6 small:grid-cols-3 medium:grid-cols-4">
            {products.slice(0, 24).map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} region={region} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sc-steel">
            This catalogue is being published. Use the collection link or
            request a quote and we will source the SKU.
          </p>
        )}
        {products.length > 24 ? (
          <div className="mt-10">
            <LocalizedClientLink
              href={`/collections/${brand.collectionHandle}`}
              className="text-sm font-semibold uppercase tracking-[0.08em] text-sc-ink hover:text-sc-cta"
            >
              See all {brand.label} products →
            </LocalizedClientLink>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default BrandCatalogHub
