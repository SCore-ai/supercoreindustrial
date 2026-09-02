/**
 * Supercore storefront regions — one Medusa region per pricing currency.
 * Country ISO-2 codes map to GBP, EUR, or USD via middleware + getRegion().
 */
export type MultiRegionDefinition = {
  name: string
  currency_code: "gbp" | "eur" | "usd"
  countries: string[]
}

export const MULTI_REGION_DEFINITIONS: MultiRegionDefinition[] = [
  {
    name: "United Kingdom",
    currency_code: "gbp",
    countries: ["gb"],
  },
  {
    name: "Europe",
    currency_code: "eur",
    countries: ["de", "dk", "se", "fr", "es", "it", "nl", "no"],
  },
  {
    name: "United States & Middle East",
    currency_code: "usd",
    countries: ["us", "ae"],
  },
]

export const ALL_MULTI_REGION_COUNTRIES = MULTI_REGION_DEFINITIONS.flatMap(
  (region) => region.countries
)

export const MULTI_REGION_CURRENCY_CODES = ["gbp", "eur", "usd"] as const

export function regionShippingPrices(
  regionIds: Record<"gbp" | "eur" | "usd", string>,
  amounts: { gbp: number; eur: number; usd: number }
) {
  return [
    { currency_code: "gbp", amount: amounts.gbp },
    { currency_code: "eur", amount: amounts.eur },
    { currency_code: "usd", amount: amounts.usd },
    { region_id: regionIds.gbp, amount: amounts.gbp },
    { region_id: regionIds.eur, amount: amounts.eur },
    { region_id: regionIds.usd, amount: amounts.usd },
  ]
}
