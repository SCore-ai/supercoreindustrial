import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)

  try {
    const quote = await quoteService.retrieveWithItems(id)
    res.json({ quote })
  } catch {
    res.status(404).json({ message: "Quote not found" })
  }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { region_id?: string | null }
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)

  if (body.region_id === undefined) {
    res.status(400).json({ message: "region_id is required" })
    return
  }

  try {
    const quote = await quoteService.updateQuotes({
      id,
      region_id: body.region_id,
    })
    res.json({ quote })
  } catch {
    res.status(404).json({ message: "Quote not found" })
  }
}
