import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const variantId = req.query.variant_id as string | undefined
  const customerGroupId = req.query.customer_group_id as string | undefined
  const status = req.query.status as "active" | "disabled" | undefined
  const limit = req.query.limit ? Number(req.query.limit) : 50
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const { tiers, count } = await b2bService.listPricingTiersForAdmin({
    variant_id: variantId,
    customer_group_id: customerGroupId,
    status,
    limit,
    offset,
  })

  res.json({ tiers, count, limit, offset })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const body = (req.body || {}) as {
    name: string
    customer_group_id?: string | null
    variant_id?: string | null
    product_id?: string | null
    min_quantity?: number
    max_quantity?: number | null
    unit_price?: number | null
    currency_code?: string
    discount_percent?: number
    priority?: number
    status?: "active" | "disabled"
  }

  const tier = await b2bService.createPricingTier(body)
  res.status(201).json({ tier })
}
