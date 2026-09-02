import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { enrichAdminQuoteResponse } from "../../../../../../lib/b2b/enrich-admin-quote"
import { auditFromRequest } from "../../../../../../lib/security/audit"
import convertQuoteToOrderWorkflow from "../../../../../../workflows/quote/convert-quote-to-order"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { admin_notes?: string | null }

  const { result } = await convertQuoteToOrderWorkflow(req.scope).run({
    input: {
      quote_id: id,
      admin_notes: body.admin_notes,
    },
  })

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "quote.converted",
    resource_type: "quote",
    resource_id: id,
    company_id: result.quote?.company_id ?? null,
    summary: `Converted quote ${id} to order ${result.order_id}`,
  })

  res.status(201).json({
    order_id: result.order_id,
    quote: await enrichAdminQuoteResponse(req.scope, result.quote),
  })
}
