import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { parseQuoteMetadata } from "../../../../../../lib/b2b/quote-integration"
import { enrichQuoteLineItems } from "../../../../../../lib/b2b/enrich-quote-items"
import { QUOTE_MODULE } from "../../../../../../modules/quote"
import QuoteModuleService from "../../../../../../modules/quote/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
  const { orderId } = req.params

  const quote = await quoteService.findQuoteByOrderId(orderId)

  if (!quote) {
    res.status(404).json({ message: "No quote linked to this order" })
    return
  }

  const items = await enrichQuoteLineItems(req.scope, quote.items)

  res.json({
    quote: {
      ...quote,
      items,
      b2b: parseQuoteMetadata(quote.metadata as Record<string, unknown>),
    },
  })
}
