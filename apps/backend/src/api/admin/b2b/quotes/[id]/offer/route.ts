import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { enrichAdminQuoteResponse } from "../../../../../../lib/b2b/enrich-admin-quote"
import adminSendQuoteOfferWorkflow from "../../../../../../workflows/quote/admin-send-quote-offer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as {
    currency_code?: string | null
    valid_until?: string | null
    admin_notes?: string | null
    line_items?: Array<{
      id: string
      unit_price?: number | null
      discount_percent?: number
    }>
  }

  const { result: quote } = await adminSendQuoteOfferWorkflow(req.scope).run({
    input: {
      quote_id: id,
      currency_code: body.currency_code,
      valid_until: body.valid_until,
      admin_notes: body.admin_notes,
      line_items: body.line_items,
    },
  })

  res.json({
    quote: await enrichAdminQuoteResponse(req.scope, quote),
  })
}
