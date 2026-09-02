"use client"

import { fetchTierPrice, type ResolvedB2bTierPrice } from "@lib/data/b2b"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import { useEffect, useMemo, useState } from "react"

type ProductVatPriceProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  quantity?: number
  vatRate?: number
  hidePriceForGuest?: boolean
  tieredPricingEnabled?: boolean
  isLoggedIn?: boolean
  currencyCode?: string
  compact?: boolean
  inline?: boolean
}

export default function ProductVatPrice({
  product,
  variant,
  quantity = 1,
  vatRate = 20,
  hidePriceForGuest = false,
  tieredPricingEnabled = false,
  isLoggedIn = false,
  currencyCode,
  compact = false,
  inline = false,
}: ProductVatPriceProps) {
  const catalogPrice = variant
    ? getProductPrice({ product, variantId: variant.id }).variantPrice
    : getProductPrice({ product }).cheapestPrice

  const baseUnitPrice = catalogPrice?.calculated_price_number ?? null
  const resolvedCurrency = currencyCode ?? catalogPrice?.currency_code ?? "gbp"
  const showFrom = !variant && (product.variants?.length ?? 0) > 1

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

  const unitExclVat = useMemo(() => {
    if (tierPrice?.unit_price != null) {
      return tierPrice.unit_price as number
    }
    return baseUnitPrice
  }, [tierPrice, baseUnitPrice])

  const wrapperClass = clx(
    inline ? "py-0" : "sc-product-price-block",
    compact && "border-0 py-0"
  )

  if (hidePriceForGuest) {
    return (
      <div className={wrapperClass}>
        <p className="text-lg font-semibold text-sc-body">Sign in for pricing</p>
      </div>
    )
  }

  if (unitExclVat == null) {
    return (
      <div className={wrapperClass}>
        <p className="text-sm font-semibold uppercase tracking-wide text-sc-steel">
          Pricing
        </p>
        <p className="mt-1 text-xl font-bold text-sc-ink">Hide Price</p>
        <p className="mt-1 text-sm text-sc-steel">
          Request a quote for this configuration
        </p>
      </div>
    )
  }

  const lineExclVat = unitExclVat * quantity
  const lineInclVat = lineExclVat * (1 + vatRate / 100)

  return (
    <div className={wrapperClass}>
      {catalogPrice?.price_type === "sale" && catalogPrice.original_price && (
        <p className="mb-1 text-[15px] text-sc-steel">
          <span className="mr-2">Was:</span>
          <span className="line-through">{catalogPrice.original_price}</span>
          <span className="ml-2 font-semibold text-sc-cta">
            Save {catalogPrice.percentage_diff}%
          </span>
        </p>
      )}
      <p className="text-[15px] font-medium text-sc-steel">
        {showFrom ? "Now from:" : "Now:"}
      </p>
      <p
        className={clx(
          "sc-product-price-now mt-0.5",
          inline && "text-[1.75rem] small:text-[2rem]"
        )}
        data-testid="product-price-excl-vat"
        data-value={lineExclVat}
      >
        {convertToLocale({
          amount: lineExclVat,
          currency_code: resolvedCurrency,
        })}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-sc-steel">
        excl. VAT
      </p>
      <p
        className="mt-0.5 text-[14px] text-sc-steel"
        data-testid="product-price-incl-vat"
      >
        (incl. {vatRate}% VAT{" "}
        {convertToLocale({
          amount: lineInclVat,
          currency_code: resolvedCurrency,
        })}
        )
      </p>
      {quantity > 1 && variant && (
        <p className="mt-1.5 text-xs text-sc-steel">
          {convertToLocale({
            amount: unitExclVat,
            currency_code: resolvedCurrency,
          })}{" "}
          excl. VAT per unit
        </p>
      )}
      {tierPrice?.tier?.name && (
        <p className="mt-1.5 text-xs font-semibold text-sc-cta" data-testid="tier-name">
          {tierPrice.tier.name} trade pricing applied
        </p>
      )}
    </div>
  )
}
