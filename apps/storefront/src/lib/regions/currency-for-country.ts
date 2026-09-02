/** Best-effort storefront currency from URL country segment (matches Medusa regions). */
export function currencyCodeForCountry(countryCode?: string | string[]) {
  const code = String(
    Array.isArray(countryCode) ? countryCode[0] : countryCode ?? "gb"
  )
    .trim()
    .toLowerCase()

  if (code === "us") {
    return "usd"
  }

  if (
    [
      "at",
      "be",
      "de",
      "es",
      "fr",
      "ie",
      "it",
      "nl",
      "pt",
      "se",
      "dk",
      "fi",
    ].includes(code)
  ) {
    return "eur"
  }

  return "gbp"
}
