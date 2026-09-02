import {
  ensureProductsCollection,
  getTypesenseClient,
  PRODUCTS_COLLECTION,
} from "../typesense-client"
import type {
  AutocompleteResult,
  ProductSearchParams,
  ProductSearchResult,
  SearchFacetCount,
  SearchProductHit,
  SearchSortOption,
} from "./types"

type TypesenseHit = {
  document: Record<string, unknown>
  highlight?: Record<string, { snippet?: string; value?: string }>
}

function mapHighlight(hit: TypesenseHit) {
  const highlight = hit.highlight
  if (!highlight) {
    return undefined
  }

  return {
    title: highlight.title?.snippet || highlight.title?.value,
    sku: highlight.sku?.snippet || highlight.sku?.value,
    mpn: highlight.mpn?.snippet || highlight.mpn?.value,
  }
}

function normalizeCurrencyCode(value?: string) {
  const code = String(value ?? "gbp").trim().toLowerCase()
  if (code === "eur" || code === "usd") {
    return code
  }
  return "gbp"
}

function priceFieldForCurrency(currencyCode: string) {
  switch (currencyCode) {
    case "eur":
      return "price_from_eur"
    case "usd":
      return "price_from_usd"
    default:
      return "price_from_gbp"
  }
}

function readIndexedPrice(
  doc: Record<string, unknown>,
  currencyCode: string
): number | null {
  const field = priceFieldForCurrency(currencyCode)
  const preferred = doc[field]
  if (typeof preferred === "number" && preferred > 0) {
    return preferred
  }
  const fallback = doc.price_from
  if (typeof fallback === "number" && fallback > 0) {
    return fallback
  }
  return null
}

function mapDocument(
  hit: TypesenseHit,
  currencyCode = "gbp"
): SearchProductHit {
  const doc = hit.document

  return {
    id: String(doc.id ?? ""),
    title: String(doc.title ?? ""),
    handle: String(doc.handle ?? ""),
    thumbnail: doc.thumbnail ? String(doc.thumbnail) : null,
    sku: Array.isArray(doc.sku) ? doc.sku.map(String) : [],
    mpn: Array.isArray(doc.mpn) ? doc.mpn.map(String) : [],
    manufacturer: doc.manufacturer ? String(doc.manufacturer) : null,
    category: Array.isArray(doc.category) ? doc.category.map(String) : [],
    certification: Array.isArray(doc.certification)
      ? doc.certification.map(String)
      : [],
    has_price: Boolean(doc.has_price),
    in_stock: Boolean(doc.in_stock),
    price_from: readIndexedPrice(doc, currencyCode),
    highlight: mapHighlight(hit),
  }
}

function buildFilterBy(params: ProductSearchParams) {
  const filters: string[] = [`status:=published`]

  if (params.category?.length) {
    filters.push(`category:=[${params.category.map(quoteFilterValue).join(",")}]`)
  }

  if (params.certification?.length) {
    filters.push(
      `certification:=[${params.certification.map(quoteFilterValue).join(",")}]`
    )
  }

  if (params.manufacturer?.length) {
    filters.push(
      `manufacturer:=[${params.manufacturer.map(quoteFilterValue).join(",")}]`
    )
  }

  if (params.hasPrice === true) {
    filters.push("has_price:=true")
  }

  if (params.hasPrice === false) {
    filters.push("has_price:=false")
  }

  if (params.inStock === true) {
    filters.push("in_stock:=true")
  }

  if (params.inStock === false) {
    filters.push("in_stock:=false")
  }

  return filters.join(" && ")
}

function quoteFilterValue(value: string) {
  return `\`${value.replace(/`/g, "\\`")}\``
}

function buildSortBy(
  sort: SearchSortOption = "relevance",
  currencyCode = "gbp"
) {
  const priceField = priceFieldForCurrency(currencyCode)

  switch (sort) {
    case "title_asc":
      return "title_sort:asc"
    case "title_desc":
      return "title_sort:desc"
    case "price_asc":
      return `${priceField}:asc`
    case "price_desc":
      return `${priceField}:desc`
    default:
      return undefined
  }
}

function buildQueryBy(mpnOnly?: boolean) {
  if (mpnOnly) {
    return {
      query_by: "mpn,sku",
      query_by_weights: "4,2",
    }
  }

  return {
    query_by: "title,sku,mpn,manufacturer,description",
    query_by_weights: "4,5,5,2,1",
  }
}

export async function searchProducts(
  params: ProductSearchParams
): Promise<ProductSearchResult> {
  const q = params.q.trim() || "*"
  const page = params.page ?? 1
  const perPage = Math.min(params.perPage ?? 20, 100)
  const currencyCode = normalizeCurrencyCode(params.currencyCode)

  await ensureProductsCollection()
  const client = getTypesenseClient()

  const { query_by, query_by_weights } = buildQueryBy(params.mpnOnly)
  const filter_by = buildFilterBy(params)
  const sort_by = buildSortBy(params.sort, currencyCode)

  const searchParams: Record<string, unknown> = {
    q,
    query_by,
    query_by_weights,
    filter_by,
    facet_by: "category,certification,has_price,manufacturer,in_stock",
    max_facet_values: 20,
    page,
    per_page: perPage,
    prefix: true,
    num_typos: q === "*" ? 0 : 2,
    typo_tokens_threshold: 1,
    drop_tokens_threshold: 1,
    highlight_full_fields: "title,sku,mpn",
  }

  if (sort_by) {
    searchParams.sort_by = sort_by
  }

  const results = await client
    .collections(PRODUCTS_COLLECTION)
    .documents()
    .search(searchParams as any)

  return {
    hits: (results.hits || []).map((hit) => mapDocument(hit, currencyCode)),
    found: results.found ?? 0,
    facet_counts: (results.facet_counts || []) as SearchFacetCount[],
    page,
    per_page: perPage,
  }
}

export async function autocompleteProducts(
  q: string,
  options?: { mpnOnly?: boolean; limit?: number; currencyCode?: string }
): Promise<AutocompleteResult> {
  const trimmed = q.trim()
  if (trimmed.length < 2) {
    return { products: [], categories: [], found: 0 }
  }

  const currencyCode = normalizeCurrencyCode(options?.currencyCode)

  await ensureProductsCollection()
  const client = getTypesenseClient()
  const limit = Math.min(options?.limit ?? 8, 12)
  const { query_by, query_by_weights } = buildQueryBy(options?.mpnOnly)

  const results = await client.collections(PRODUCTS_COLLECTION).documents().search({
    q: trimmed,
    query_by,
    query_by_weights,
    filter_by: "status:=published",
    facet_by: "category",
    max_facet_values: 6,
    page: 1,
    per_page: limit,
    prefix: true,
    num_typos: 2,
    typo_tokens_threshold: 1,
    highlight_full_fields: "title,sku,mpn",
  })

  const products = (results.hits || []).map((hit) =>
    mapDocument(hit, currencyCode)
  )
  const categoryFacet = (results.facet_counts || []).find(
    (facet) => facet.field_name === "category"
  )

  const categories =
    categoryFacet?.counts?.map((entry) => ({
      name: String(entry.value),
      count: entry.count,
    })) ?? []

  return {
    products,
    categories,
    found: results.found ?? 0,
  }
}
