import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { requireB2bFeature } from "../../../lib/b2b/settings-guard"
import { createQuoteWorkflow } from "../../../workflows/quote/create-quote"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "quotes_enabled")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const body = (req.body || {}) as { region_id?: string }

  const { result: quote } = await createQuoteWorkflow(req.scope).run({
    input: {
      region_id: body.region_id ?? null,
    },
  })

  res.status(201).json({ quote })
}
