import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { autocompleteProducts } from "../../../../lib/search/typesense-search"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = (req.query.q as string) || ""
  const mpnOnly = req.query.mpn_only === "true"
  const limit = Number(req.query.limit || 8)

  try {
    const result = await autocompleteProducts(q, {
      mpnOnly,
      limit,
      currencyCode: (req.query.currency_code as string | undefined) ?? "gbp",
    })
    res.json(result)
  } catch {
    res.status(503).json({
      products: [],
      categories: [],
      found: 0,
      error: "Autocomplete is temporarily unavailable.",
    })
  }
}
