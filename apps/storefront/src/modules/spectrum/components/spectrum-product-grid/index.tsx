import { HttpTypes } from "@medusajs/types"
import { getProductPageContent } from "@lib/util/product-page-content"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const SpectrumProductGrid = ({
  products,
  region: _region,
}: {
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}) => {
  if (!products.length) {
    return (
      <p className="py-12 text-sm text-[var(--spc-muted)]">
        Products for this series are being published. Request a quote and we
        will match the Spectrum SKU.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-4 small:grid-cols-3 large:grid-cols-4">
      {products.map((product) => {
        const { cheapestPrice } = getProductPrice({ product })
        const content = getProductPageContent(product)
        const sku =
          product.variants?.[0]?.sku ||
          (typeof product.metadata?.mpn === "string"
            ? product.metadata.mpn
            : null)

        return (
          <li key={product.id}>
            <LocalizedClientLink
              href={`/products/${product.handle}`}
              className="group block rounded-lg border border-[var(--spc-line)] bg-[var(--spc-surface)] p-3"
            >
              <Thumbnail
                thumbnail={product.thumbnail}
                images={product.images}
                size="square"
                className="!rounded-md !bg-[var(--spc-elevated)] !shadow-none"
              />
              <div className="mt-3 min-w-0">
                {sku ? (
                  <p className="truncate text-[11px] uppercase tracking-wide text-[var(--spc-muted)]">
                    {sku}
                  </p>
                ) : null}
                <p className="mt-1 line-clamp-2 text-sm text-white">
                  {product.title}
                </p>
                {content.manufacturer ? (
                  <p className="mt-1 text-xs text-[var(--spc-muted)]">
                    {content.manufacturer}
                  </p>
                ) : null}
                {cheapestPrice ? (
                  <p className="mt-2 text-sm font-semibold text-sc-cta">
                    {cheapestPrice.calculated_price}
                  </p>
                ) : null}
              </div>
            </LocalizedClientLink>
          </li>
        )
      })}
    </ul>
  )
}

export default SpectrumProductGrid
