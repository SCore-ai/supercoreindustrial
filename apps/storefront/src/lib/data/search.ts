"use server"

import { sdk } from "@lib/config"

export type SearchHitHighlight = {
  title?: string
  sku?: string
  mpn?: string
}

export type SearchHit = {
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

export type SearchSortOption =
  | "relevance"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"

export type SearchResponse = {
  hits: SearchHit[]
  found: number
  facet_counts: SearchFacetCount[]
  page: number
  per_page: number
  error?: string
}

export type AutocompleteResponse = {
  products: SearchHit[]
  categories: Array<{ name: string; count: number }>
  found: number
  error?: string
}

export type PopularSearchResponse = {
  popular: Array<{
    query: string
    count: number
    last_searched_at: string
  }>
}

export const searchProducts = async ({
  q,
  mpnOnly,
  category,
  certification,
  manufacturer,
  hasPrice,
  inStock,
  sort,
  page = 1,
  perPage = 20,
  currencyCode = "gbp",
}: {
  q: string
  mpnOnly?: boolean
  category?: string[]
  certification?: string[]
  manufacturer?: string[]
  hasPrice?: boolean | null
  inStock?: boolean | null
  sort?: SearchSortOption
  page?: number
  perPage?: number
  currencyCode?: string
}): Promise<SearchResponse> => {
  if (!q.trim()) {
    return { hits: [], found: 0, facet_counts: [], page: 1, per_page: perPage }
  }

  return sdk.client
    .fetch<SearchResponse>(`/store/search`, {
      method: "GET",
      query: {
        q,
        mpn_only: mpnOnly ? "true" : undefined,
        category: category?.length ? category.join(",") : undefined,
        certification: certification?.length ? certification.join(",") : undefined,
        manufacturer: manufacturer?.length ? manufacturer.join(",") : undefined,
        has_price:
          hasPrice === true ? "true" : hasPrice === false ? "false" : undefined,
        in_stock:
          inStock === true ? "true" : inStock === false ? "false" : undefined,
        sort: sort && sort !== "relevance" ? sort : undefined,
        page,
        per_page: perPage,
        currency_code: currencyCode,
      },
      cache: "no-store",
    })
    .catch(
      (): SearchResponse => ({
        hits: [],
        found: 0,
        facet_counts: [],
        page: 1,
        per_page: perPage,
        error: "Search is temporarily unavailable.",
      })
    )
}

export const autocompleteSearch = async ({
  q,
  mpnOnly,
  limit = 8,
  currencyCode = "gbp",
}: {
  q: string
  mpnOnly?: boolean
  limit?: number
  currencyCode?: string
}): Promise<AutocompleteResponse> => {
  if (q.trim().length < 2) {
    return { products: [], categories: [], found: 0 }
  }

  return sdk.client
    .fetch<AutocompleteResponse>(`/store/search/autocomplete`, {
      method: "GET",
      query: {
        q,
        mpn_only: mpnOnly ? "true" : undefined,
        limit,
        currency_code: currencyCode,
      },
      cache: "no-store",
    })
    .catch(
      (): AutocompleteResponse => ({
        products: [],
        categories: [],
        found: 0,
        error: "Autocomplete is temporarily unavailable.",
      })
    )
}

export const fetchPopularSearches = async (): Promise<PopularSearchResponse> => {
  return sdk.client
    .fetch<PopularSearchResponse>(`/store/search/popular`, {
      method: "GET",
      cache: "no-store",
    })
    .catch(() => ({ popular: [] }))
}
