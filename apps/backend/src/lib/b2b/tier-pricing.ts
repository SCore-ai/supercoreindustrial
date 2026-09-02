export type TierLike = {
  id: string
  name: string
  unit_price?: number | null
  discount_percent?: number | null
  currency_code?: string | null
  min_quantity?: number | null
  max_quantity?: number | null
}

export function computeTierUnitPrice(
  tier: TierLike | null | undefined,
  baseUnitPrice: number | null | undefined
): number | null {
  if (!tier) {
    return null
  }

  if (tier.unit_price != null) {
    return tier.unit_price
  }

  const discount = tier.discount_percent ?? 0

  if (discount > 0 && baseUnitPrice != null) {
    return (
      Math.round(baseUnitPrice * (1 - discount / 100) * 100) / 100
    )
  }

  return null
}

export type ResolvedTierPrice = {
  tier: TierLike | null
  base_unit_price: number | null
  unit_price: number | null
  savings_percent: number | null
}

export function resolveTierPriceDetails(
  tier: TierLike | null | undefined,
  baseUnitPrice: number | null | undefined
): ResolvedTierPrice {
  const unitPrice = computeTierUnitPrice(tier, baseUnitPrice)
  let savingsPercent: number | null = null

  if (
    tier &&
    unitPrice != null &&
    baseUnitPrice != null &&
    baseUnitPrice > 0 &&
    unitPrice < baseUnitPrice
  ) {
    savingsPercent = Math.round(
      ((baseUnitPrice - unitPrice) / baseUnitPrice) * 100
    )
  }

  return {
    tier: tier ?? null,
    base_unit_price: baseUnitPrice ?? null,
    unit_price: unitPrice,
    savings_percent: savingsPercent,
  }
}
