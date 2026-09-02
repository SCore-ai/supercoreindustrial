"use client"

import { fetchTierPrice, type ResolvedB2bTierPrice } from "@lib/data/b2b"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { useEffect, useState } from "react"
import ProductPrice from "../product-price"

type ProductTierPriceProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  hidePriceForGuest?: boolean
  tieredPricingEnabled?: boolean
  isLoggedIn?: boolean
  quantity?: number
  currencyCode?: string
}

export default function ProductTierPrice({
  product,
  variant,
  hidePriceForGuest = false,
  tieredPricingEnabled = false,
  isLoggedIn = false,
  quantity = 1,
  currencyCode,
}: ProductTierPriceProps) {
  const catalogPrice = variant
    ? getProductPrice({ product, variantId: variant.id }).variantPrice
    : getProductPrice({ product }).cheapestPrice

  const baseUnitPrice = catalogPrice?.calculated_price_number ?? null
  const resolvedCurrency = currencyCode ?? catalogPrice?.currency_code ?? "gbp"

  const [tierPrice, setTierPrice] = useState<ResolvedB2bTierPrice | null>(null)

  useEffect(() => {
    let cancelled = false

    if (
      !tieredPricingEnabled ||
      !isLoggedIn ||
      !variant?.id ||
      baseUnitPrice == null
    ) {
      setTierPrice(null)
      return
    }

    fetchTierPrice({
      variantId: variant.id,
      quantity,
      currencyCode: resolvedCurrency,
      baseUnitPrice,
    }).then((result) => {
      if (!cancelled) {
        setTierPrice(result)
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    tieredPricingEnabled,
    isLoggedIn,
    variant?.id,
    quantity,
    resolvedCurrency,
    baseUnitPrice,
  ])

  if (
    tierPrice?.unit_price != null &&
    baseUnitPrice != null &&
    tierPrice.unit_price < baseUnitPrice
  ) {
    return (
      <TierPriceDisplay
        tierPrice={tierPrice}
        currencyCode={resolvedCurrency}
        hidePriceForGuest={hidePriceForGuest}
      />
    )
  }

  return (
    <ProductPrice
      product={product}
      variant={variant}
      hidePriceForGuest={hidePriceForGuest}
    />
  )
}

function TierPriceDisplay({
  tierPrice,
  currencyCode,
  hidePriceForGuest,
}: {
  tierPrice: ResolvedB2bTierPrice
  currencyCode: string
  hidePriceForGuest?: boolean
}) {
  if (hidePriceForGuest) {
    return (
      <div className="flex flex-col text-ui-fg-base">
        <span className="text-xl-semi">Sign in for pricing</span>
      </div>
    )
  }

  const unitPrice = tierPrice.unit_price as number
  const basePrice = tierPrice.base_unit_price

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span className="text-xl-semi text-ui-fg-interactive">
        <span data-testid="product-tier-price" data-value={unitPrice}>
          {convertToLocale({
            amount: unitPrice,
            currency_code: currencyCode,
          })}
        </span>
      </span>
      {basePrice != null && basePrice > unitPrice && (
        <p className="text-small-regular text-ui-fg-subtle">
          <span>List: </span>
          <span className="line-through" data-testid="product-list-price">
            {convertToLocale({
              amount: basePrice,
              currency_code: currencyCode,
            })}
          </span>
          {tierPrice.savings_percent != null && tierPrice.savings_percent > 0 && (
            <span className={clx("ml-2 text-ui-fg-interactive")}>
              -{tierPrice.savings_percent}% trade
            </span>
          )}
        </p>
      )}
      {tierPrice.tier?.name && (
        <span className="text-xsmall text-ui-fg-subtle" data-testid="tier-name">
          {tierPrice.tier.name}
          {tierPrice.tier.min_quantity != null &&
            tierPrice.tier.min_quantity > 1 &&
            ` (qty ${tierPrice.tier.min_quantity}+)`}
        </span>
      )}
    </div>
  )
}
