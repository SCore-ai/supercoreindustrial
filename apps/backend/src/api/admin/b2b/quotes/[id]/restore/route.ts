import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { enrichAdminQuoteResponse } from "../../../../../../lib/b2b/enrich-admin-quote"
import { QUOTE_MODULE } from "../../../../../../modules/quote"
import QuoteModuleService from "../../../../../../modules/quote/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
  const { id } = req.params

  const quote = await quoteService.adminRestoreQuote(id)

  res.json({
    quote: await enrichAdminQuoteResponse(req.scope, quote),
  })
}
