const CURRENCY_LABELS: Record<string, string> = {
  gbp: "GBP",
  eur: "EUR",
  usd: "USD",
}

export function formatRegionCurrency(currencyCode?: string | null) {
  if (!currencyCode) {
    return ""
  }

  return CURRENCY_LABELS[currencyCode.toLowerCase()] ?? currencyCode.toUpperCase()
}

export function formatCountryOptionLabel(
  countryLabel: string,
  currencyCode?: string | null
) {
  const currency = formatRegionCurrency(currencyCode)
  return currency ? `${countryLabel} · ${currency}` : countryLabel
}
