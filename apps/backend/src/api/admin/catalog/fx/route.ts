import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATALOG_MODULE } from "../../../../modules/catalog"
import CatalogModuleService from "../../../../modules/catalog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const catalog: CatalogModuleService = req.scope.resolve(CATALOG_MODULE)
  const rates = await catalog.listActiveRates()

  res.json({
    base_currency: "gbp",
    supported: ["gbp", "eur", "usd"],
    rates,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const catalog: CatalogModuleService = req.scope.resolve(CATALOG_MODULE)
  const body = (req.body || {}) as {
    from_currency?: string
    to_currency?: string
    rate?: number
    notes?: string | null
    upsert_inverse?: boolean
  }

  if (!body.from_currency || !body.to_currency || !(Number(body.rate) > 0)) {
    res.status(400).json({
      message: "from_currency, to_currency and positive rate are required",
    })
    return
  }

  if (body.upsert_inverse !== false) {
    const pair = await catalog.upsertRatePair({
      base: body.from_currency,
      quote: body.to_currency,
      rate: Number(body.rate),
      source: "manual",
      notes: body.notes ?? null,
    })
    res.json(pair)
    return
  }

  const rate = await catalog.upsertRate({
    from_currency: body.from_currency,
    to_currency: body.to_currency,
    rate: Number(body.rate),
    notes: body.notes ?? null,
  })

  res.json({ rate })
}
