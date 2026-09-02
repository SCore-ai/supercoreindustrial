import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SEARCH_ANALYTICS_MODULE } from "../../../../modules/search-analytics"
import SearchAnalyticsModuleService from "../../../../modules/search-analytics/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: SearchAnalyticsModuleService = req.scope.resolve(
    SEARCH_ANALYTICS_MODULE
  )
  const limit = Math.min(Number(req.query.limit || 8), 20)
  const popular = await service.getPopularQueries(limit)

  res.json({ popular })
}
