export type SearchHitHighlight = {
  title?: string
  sku?: string
  mpn?: string
}

export type SearchProductHit = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  sku: string[]
  mpn: string[]
  manufacturer: string | null
  category: string[]
  certification: string[]
  has_price: boolean
  in_stock: boolean
  price_from: number | null
  highlight?: SearchHitHighlight
}

export type SearchFacetCount = {
  field_name: string
  counts: Array<{ value: string; count: number }>
}

export type SearchSortOption = "relevance" | "title_asc" | "title_desc" | "price_asc" | "price_desc"

export type ProductSearchParams = {
  q: string
  mpnOnly?: boolean
  category?: string[]
  certification?: string[]
  manufacturer?: string[]
  hasPrice?: boolean | null
  inStock?: boolean | null
  page?: number
  perPage?: number
  sort?: SearchSortOption
  currencyCode?: string
}

export type ProductSearchResult = {
  hits: SearchProductHit[]
  found: number
  facet_counts: SearchFacetCount[]
  page: number
  per_page: number
}

export type AutocompleteCategorySuggestion = {
  name: string
  count: number
}

export type AutocompleteResult = {
  products: SearchProductHit[]
  categories: AutocompleteCategorySuggestion[]
  found: number
}

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase()
}

export function parseMultiValueParam(value?: string | string[]) {
  if (!value) {
    return []
  }

  const raw = Array.isArray(value) ? value.join(",") : value
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}
