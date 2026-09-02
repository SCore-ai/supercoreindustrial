import { clx } from "@modules/common/components/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
  hidePriceForGuest = false,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  hidePriceForGuest?: boolean
}) {
  if (hidePriceForGuest) {
    return (
      <div className="flex flex-col text-ui-fg-base">
        <span className="text-xl-semi" data-testid="product-price-sign-in">
          Sign in for pricing
        </span>
      </div>
    )
  }

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    if (!variant) {
      return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
    }

    return (
      <div className="flex flex-col text-ui-fg-base">
        <span className="text-xl-semi" data-testid="product-price-quote-only">
          Hide Price
        </span>
        <span className="mt-1 text-sm text-ui-fg-subtle">
          Request a quote for pricing
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("text-xl-semi", {
          "text-ui-fg-interactive": selectedPrice.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
