import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
  const status = req.query.status as "draft" | "submitted" | undefined
  const includeArchived = req.query.include_archived === "true"
  const archivedOnly = req.query.archived_only === "true"
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const { quotes, count } = await quoteService.listQuotesForAdmin({
    status,
    include_archived: includeArchived,
    archived_only: archivedOnly,
    limit,
    offset,
  })

  res.json({
    quotes,
    count,
    limit,
    offset,
  })
}
