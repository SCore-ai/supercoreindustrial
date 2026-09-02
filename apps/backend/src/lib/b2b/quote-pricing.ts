export type QuoteLinePricingInput = {
  id: string
  unit_price?: number | null
  discount_percent?: number
}

export function calculateLineTotal(item: {
  quantity: number
  unit_price?: number | null
  discount_percent?: number | null
}): number | null {
  const unitPrice = calculateLineUnitPrice(item)

  if (unitPrice == null) {
    return null
  }

  return Math.round(unitPrice * item.quantity * 100) / 100
}

export function calculateLineUnitPrice(item: {
  unit_price?: number | null
  discount_percent?: number | null
}): number | null {
  if (item.unit_price == null) {
    return null
  }

  const discount = item.discount_percent ?? 0
  return Math.round(item.unit_price * (1 - discount / 100) * 100) / 100
}

export function calculateQuoteOfferTotal(
  items: Array<{
    quantity: number
    unit_price?: number | null
    discount_percent?: number | null
  }>
): number | null {
  let total = 0
  let hasPricing = false

  for (const item of items) {
    const lineTotal = calculateLineTotal(item)

    if (lineTotal == null) {
      continue
    }

    hasPricing = true
    total += lineTotal
  }

  return hasPricing ? Math.round(total * 100) / 100 : null
}

export function resolveCurrencyForRegion(
  regionId: string | null | undefined,
  regionCurrency?: string | null
): string {
  if (regionCurrency) {
    return regionCurrency
  }

  return "gbp"
}
