import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import {
  getAuthenticatedCustomerId,
  resolveCustomerGroupId,
  resolveStoreB2bContext,
} from "../../../../lib/b2b/customer-context"
import { requireB2bFeature } from "../../../../lib/b2b/settings-guard"
import { resolveTierPriceDetails } from "../../../../lib/b2b/tier-pricing"
import { requireMemberPermission } from "../../../../lib/security/rbac"

async function requirePricingViewIfMember(
  req: MedusaRequest,
  customerId: string | null
) {
  if (!customerId) {
    return
  }

  const context = await resolveStoreB2bContext(req.scope, customerId)
  await requireMemberPermission(req.scope, context.member?.role, "pricing.view")
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "tiered_pricing_enabled")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const variantId = req.query.variant_id as string
  const quantity = req.query.quantity ? Number(req.query.quantity) : 1
  const currencyCode = req.query.currency_code as string | undefined
  const baseUnitPriceParam = req.query.base_unit_price as string | undefined
  const customerGroupQuery = req.query.customer_group_id as string | undefined

  if (!variantId) {
    res.status(400).json({ message: "variant_id is required" })
    return
  }

  const customerId = getAuthenticatedCustomerId(req)
  try {
    await requirePricingViewIfMember(req, customerId)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }
  const customerGroupId =
    customerGroupQuery ??
    (await resolveCustomerGroupId(req.scope, customerId))

  const tier = await b2bService.resolveTierPrice({
    variant_id: variantId,
    quantity,
    customer_group_id: customerGroupId ?? null,
    currency_code: currencyCode,
  })

  const baseUnitPrice = baseUnitPriceParam
    ? Number(baseUnitPriceParam)
    : null

  const resolved = resolveTierPriceDetails(tier, baseUnitPrice)

  res.json({
    ...resolved,
    quantity,
    variant_id: variantId,
    customer_group_id: customerGroupId,
  })
}

type BatchPricingBody = {
  items: Array<{
    variant_id: string
    quantity?: number
    base_unit_price?: number | null
  }>
  currency_code?: string
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "tiered_pricing_enabled")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const body = (req.body || {}) as BatchPricingBody
  const items = body.items ?? []

  if (!items.length) {
    res.status(400).json({ message: "items array is required" })
    return
  }

  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const customerId = getAuthenticatedCustomerId(req)
  try {
    await requirePricingViewIfMember(req, customerId)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }
  const customerGroupId = await resolveCustomerGroupId(req.scope, customerId)

  const results = await Promise.all(
    items.map(async (item) => {
      const quantity = item.quantity ?? 1
      const tier = await b2bService.resolveTierPrice({
        variant_id: item.variant_id,
        quantity,
        customer_group_id: customerGroupId ?? null,
        currency_code: body.currency_code,
      })

      const resolved = resolveTierPriceDetails(tier, item.base_unit_price ?? null)

      return {
        variant_id: item.variant_id,
        quantity,
        ...resolved,
      }
    })
  )

  res.json({
    customer_group_id: customerGroupId,
    items: results,
  })
}
