export const DEFAULT_STORE_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"

export const STORE_CURRENCY_CODES = ["gbp", "eur", "usd"] as const

export type StoreCurrencyCode = (typeof STORE_CURRENCY_CODES)[number]
