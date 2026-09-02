import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEARCH_ANALYTICS_MODULE } from "../../../modules/search-analytics"
import SearchAnalyticsModuleService from "../../../modules/search-analytics/service"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  const service: SearchAnalyticsModuleService = _req.scope.resolve(
    SEARCH_ANALYTICS_MODULE
  )

  const [popular, recentEvents] = await Promise.all([
    service.getPopularQueries(20),
    service.listSearchQueryEvents(
      {},
      {
        take: 50,
        order: { created_at: "DESC" },
      }
    ),
  ])

  res.json({
    popular,
    recent: recentEvents.map((event) => ({
      id: event.id,
      query: event.query,
      result_count: event.result_count,
      mpn_only: event.mpn_only,
      created_at:
        typeof event.created_at === "string"
          ? event.created_at
          : event.created_at?.toISOString?.(),
    })),
  })
}
