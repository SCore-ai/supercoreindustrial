import { MedusaService } from "@medusajs/framework/utils"
import { normalizeSearchQuery } from "../../lib/search/types"
import SearchQueryEvent from "./models/search-query-event"

export type RecordSearchInput = {
  query: string
  result_count: number
  mpn_only?: boolean
}

export type PopularSearchQuery = {
  query: string
  count: number
  last_searched_at: string
}

class SearchAnalyticsModuleService extends MedusaService({
  SearchQueryEvent,
}) {
  async recordSearch(input: RecordSearchInput) {
    const normalized = normalizeSearchQuery(input.query)
    if (normalized.length < 2) {
      return null
    }

    const [created] = await this.createSearchQueryEvents([
      {
        query: input.query.trim(),
        normalized_query: normalized,
        result_count: input.result_count,
        mpn_only: input.mpn_only ?? false,
      },
    ])

    return created
  }

  async getPopularQueries(limit = 8): Promise<PopularSearchQuery[]> {
    const events = await this.listSearchQueryEvents(
      {},
      {
        take: 500,
        order: { created_at: "DESC" },
      }
    )

    const aggregates = new Map<
      string,
      { query: string; count: number; last_searched_at: string }
    >()

    for (const event of events) {
      const key = event.normalized_query
      const createdAt =
        typeof event.created_at === "string"
          ? event.created_at
          : event.created_at?.toISOString?.() ?? new Date().toISOString()

      const existing = aggregates.get(key)
      if (!existing) {
        aggregates.set(key, {
          query: event.query,
          count: 1,
          last_searched_at: createdAt,
        })
        continue
      }

      existing.count += 1
      if (createdAt > existing.last_searched_at) {
        existing.last_searched_at = createdAt
        existing.query = event.query
      }
    }

    return [...aggregates.values()]
      .sort((a, b) => b.count - a.count || b.last_searched_at.localeCompare(a.last_searched_at))
      .slice(0, limit)
      .map((entry) => ({
        query: entry.query,
        count: entry.count,
        last_searched_at: entry.last_searched_at,
      }))
  }
}

export default SearchAnalyticsModuleService
