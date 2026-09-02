import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { enrichAdminQuoteResponse } from "../../../../../lib/b2b/enrich-admin-quote"
import { parseQuoteMetadata } from "../../../../../lib/b2b/quote-integration"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"
import { QUOTE_MODULE } from "../../../../../modules/quote"
import QuoteModuleService from "../../../../../modules/quote/service"
import adminUpdateQuoteWorkflow from "../../../../../workflows/quote/admin-update-quote"
import convertQuoteToOrderWorkflow from "../../../../../workflows/quote/convert-quote-to-order"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
  const { id } = req.params

  const quote = await quoteService.retrieveWithItems(id)

  res.json({
    quote: await enrichAdminQuoteResponse(req.scope, quote),
  })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as {
    status?: "draft" | "submitted"
    admin_status?: string
    order_id?: string | null
    admin_notes?: string | null
    company_id?: string | null
    currency_code?: string | null
    valid_until?: string | null
  }

  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
  const existing = await quoteService.retrieveQuote(id)
  const existingB2b = parseQuoteMetadata(
    existing.metadata as Record<string, unknown>
  )

  const shouldAutoConvert =
    body.admin_status === "won" &&
    !existingB2b.order_id &&
    !body.order_id

  if (shouldAutoConvert) {
    const { result } = await convertQuoteToOrderWorkflow(req.scope).run({
      input: {
        quote_id: id,
        admin_notes: body.admin_notes,
      },
    })

    res.json({
      order_id: result.order_id,
      quote: await enrichAdminQuoteResponse(req.scope, result.quote),
    })
    return
  }

  const { result: quote } = await adminUpdateQuoteWorkflow(req.scope).run({
    input: {
      id,
      status: body.status,
      admin_status: body.admin_status as never,
      order_id: body.order_id,
      admin_notes: body.admin_notes,
      company_id: body.company_id,
      currency_code: body.currency_code,
      valid_until: body.valid_until,
    },
  })

  res.json({
    quote: await enrichAdminQuoteResponse(req.scope, quote),
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params

  await b2bService.detachQuoteFromConversations(id)
  await quoteService.adminDeleteQuote(id)
  res.status(200).json({ id, deleted: true })
}
