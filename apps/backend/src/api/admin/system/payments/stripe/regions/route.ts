import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { getStripeEnvConfig } from "../../../../../../lib/payments/stripe-env"
import { enableStripeOnAllRegions } from "../../../../../../lib/payments/stripe-regions"
import { requireAdminActorId } from "../../../../../../lib/security/admin-mfa"
import { auditFromRequest } from "../../../../../../lib/security/audit"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (!requireAdminActorId(req)) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Admin authentication is required"
    )
  }

  const config = getStripeEnvConfig()

  if (!config.configured) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      config.liveBlocked
        ? "Live Stripe keys are blocked in development. Use a test key or set STRIPE_ALLOW_LIVE=true."
        : "STRIPE_API_KEY must be a Stripe secret or restricted key (sk_test_, sk_live_, rk_test_, rk_live_)."
    )
  }

  const result = await enableStripeOnAllRegions(req.scope)

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "payments.stripe.regions.enabled",
    resource_type: "payment_provider",
    resource_id: config.providerId,
    summary: `Enabled Stripe on ${result.updated} region(s)`,
    metadata: { updated: result.updated },
  })

  res.json({
    updated: result.updated,
    regions: result.regions,
  })
}
