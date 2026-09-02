import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductPageContent } from "@lib/util/product-page-content"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

import RelatedProductQuickAdd from "./related-product-quick-add"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

function variantInStock(variant: HttpTypes.StoreProductVariant) {
  if (!variant.manage_inventory) return true
  if (variant.allow_backorder) return true
  return (variant.inventory_quantity ?? 0) > 0
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  const items = products.slice(0, 3)

  return (
    <div
      id="related"
      className="sc-related-panel scroll-mt-36 mt-6 rounded-lg border border-sc-line bg-sc-search/40 p-4 small:p-5"
      data-testid="commonly-purchased-container"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold leading-snug text-sc-ink">
          Commonly purchased with:
        </h2>
        <LocalizedClientLink
          href="/store"
          className="shrink-0 text-sm font-bold text-sc-body underline underline-offset-2 hover:text-sc-cta"
        >
          See all related items
        </LocalizedClientLink>
      </div>

      <ul className="mt-3 space-y-2.5">
        {items.map((relatedProduct) => {
          const meta = getProductPageContent(relatedProduct)
          const { cheapestPrice } = getProductPrice({ product: relatedProduct })
          const variants = relatedProduct.variants ?? []
          const hasMultipleVariants = variants.length > 1
          const defaultVariant = variants[0]
          const thumb =
            relatedProduct.thumbnail ?? relatedProduct.images?.[0]?.url

          return (
            <li key={relatedProduct.id}>
              <div className="flex gap-3.5 border border-sc-line bg-white p-3">
                <LocalizedClientLink
                  href={`/products/${relatedProduct.handle}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden border border-sc-line bg-white"
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[10px] text-sc-steel">
                      No img
                    </span>
                  )}
                </LocalizedClientLink>

                <div className="min-w-0 flex-1">
                  <LocalizedClientLink
                    href={`/products/${relatedProduct.handle}`}
                    className="group block"
                  >
                    {meta.manufacturer && (
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-sc-steel">
                        {meta.manufacturer}
                      </p>
                    )}
                    <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-sc-body group-hover:text-sc-cta">
                      {relatedProduct.title}
                    </p>
                    <p className="mt-1 text-sm font-bold text-sc-ink">
                      {cheapestPrice ? (
                        convertToLocale({
                          amount: cheapestPrice.calculated_price_number,
                          currency_code: cheapestPrice.currency_code,
                        })
                      ) : (
                        "Call for price"
                      )}
                    </p>
                  </LocalizedClientLink>

                  <RelatedProductQuickAdd
                    handle={relatedProduct.handle}
                    variantId={defaultVariant?.id}
                    hasMultipleVariants={hasMultipleVariants}
                    inStock={defaultVariant ? variantInStock(defaultVariant) : false}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
