import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  autocompleteProducts,
  searchProducts,
} from "../../../lib/search/typesense-search"
import {
  parseMultiValueParam,
  type SearchSortOption,
} from "../../../lib/search/types"
import { SEARCH_ANALYTICS_MODULE } from "../../../modules/search-analytics"
import SearchAnalyticsModuleService from "../../../modules/search-analytics/service"

function parseBooleanParam(value?: string) {
  if (value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
  return null
}

function parseSort(value?: string): SearchSortOption {
  if (
    value === "title_asc" ||
    value === "title_desc" ||
    value === "price_asc" ||
    value === "price_desc"
  ) {
    return value
  }
  return "relevance"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = (req.query.q as string) || ""
  const mpnOnly = req.query.mpn_only === "true"
  const page = Number(req.query.page || 1)
  const perPage = Math.min(Number(req.query.per_page || 20), 100)
  const sort = parseSort(req.query.sort as string | undefined)

  try {
    const result = await searchProducts({
      q,
      mpnOnly,
      category: parseMultiValueParam(req.query.category as string | undefined),
      certification: parseMultiValueParam(
        req.query.certification as string | undefined
      ),
      manufacturer: parseMultiValueParam(
        req.query.manufacturer as string | undefined
      ),
      hasPrice: parseBooleanParam(req.query.has_price as string | undefined),
      inStock: parseBooleanParam(req.query.in_stock as string | undefined),
      page,
      perPage,
      sort,
      currencyCode: (req.query.currency_code as string | undefined) ?? "gbp",
    })

    if (q.trim().length >= 2) {
      try {
        const analytics: SearchAnalyticsModuleService = req.scope.resolve(
          SEARCH_ANALYTICS_MODULE
        )
        await analytics.recordSearch({
          query: q,
          result_count: result.found,
          mpn_only: mpnOnly,
        })
      } catch {
        // analytics should not block search
      }
    }

    res.json(result)
  } catch {
    res.status(503).json({
      hits: [],
      found: 0,
      facet_counts: [],
      page: 1,
      per_page: perPage,
      error: "Search is temporarily unavailable.",
    })
  }
}
