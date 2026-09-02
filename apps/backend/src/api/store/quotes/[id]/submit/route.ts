import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { submitQuoteWorkflow } from "../../../../../workflows/quote/submit-quote"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"
import { getAuthenticatedCustomerId } from "../../../../../lib/b2b/customer-context"
import {
  allowsQuoteRegistration,
  requireB2bFeature,
} from "../../../../../lib/b2b/settings-guard"

type SubmitQuoteBody = {
  email: string
  company?: string
  project?: string
  notes?: string
  customer_id?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: quoteId } = req.params
  const body = req.body as SubmitQuoteBody

  if (!body?.email) {
    res.status(400).json({ message: "email is required" })
    return
  }

  try {
    await requireB2bFeature(req.scope, "quotes_enabled")
    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const settings = await b2bService.getSettings()

    if (!allowsQuoteRegistration(settings)) {
      res.status(403).json({
        message:
          "Quote registration is disabled. Use the trade account registration form.",
      })
      return
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const customerId =
    getAuthenticatedCustomerId(req) ?? body.customer_id ?? null

  const { result: quote } = await submitQuoteWorkflow(req.scope).run({
    input: {
      quote_id: quoteId,
      email: body.email,
      company: body.company ?? null,
      project: body.project ?? null,
      notes: body.notes ?? null,
      customer_id: customerId,
    },
  })

  res.json({ quote })
}
