import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { applyCartTierPricing } from "../../../../../lib/b2b/apply-cart-tier-pricing"
import { getAuthenticatedCustomerId } from "../../../../../lib/b2b/customer-context"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id: cartId } = req.params
  const customerId = getAuthenticatedCustomerId(req)

  if (!customerId) {
    res.status(401).json({ message: "Sign in to apply B2B tier pricing" })
    return
  }

  try {
    const result = await applyCartTierPricing(req.scope, cartId, customerId)
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply pricing"
    const status =
      message.includes("disabled") || message.includes("Forbidden") ? 403 : 400
    res.status(status).json({ message })
  }
}
