import { getProductPageContent } from "@lib/util/product-page-content"
import { HttpTypes } from "@medusajs/types"

type ProductHeroHeaderProps = {
  product: HttpTypes.StoreProduct
}

const ProductHeroHeader = ({ product }: ProductHeroHeaderProps) => {
  const content = getProductPageContent(product)

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {content.brand && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-sc-steel">
            {content.brand}
          </span>
        )}
        {content.family && (
          <span className="rounded-full bg-sc-paper px-2.5 py-0.5 text-xs font-semibold text-sc-ink ring-1 ring-sc-line">
            {content.family} Series
          </span>
        )}
      </div>

      <h1
        className="font-display text-2xl font-semibold leading-tight text-sc-ink small:text-3xl"
        data-testid="product-title"
      >
        {product.title}
      </h1>
    </header>
  )
}

export default ProductHeroHeader
