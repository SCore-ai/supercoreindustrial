import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  parseQuoteMetadata,
  QuoteErpMetadata,
} from "../../../../../../lib/b2b/quote-integration"
import { enrichQuoteLineItems } from "../../../../../../lib/b2b/enrich-quote-items"
import adminUpdateQuoteIntegrationWorkflow from "../../../../../../workflows/quote/admin-update-quote-integration"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as QuoteErpMetadata

  const { result: quote } = await adminUpdateQuoteIntegrationWorkflow(
    req.scope
  ).run({
    input: {
      quote_id: id,
      erp: body,
    },
  })

  const items = await enrichQuoteLineItems(req.scope, quote.items)

  res.json({
    quote: {
      ...quote,
      items,
      b2b: parseQuoteMetadata(quote.metadata as Record<string, unknown>),
    },
  })
}
