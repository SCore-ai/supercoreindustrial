import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  STRIPE_WEBHOOK_EVENTS,
  getStripeEnvConfig,
  getStripeWebhookUrl,
  maskCredential,
} from "../../../../../lib/payments/stripe-env"
import {
  isStripeProviderRegistered,
  listRegionStripeStatus,
} from "../../../../../lib/payments/stripe-regions"
import { requireAdminActorId } from "../../../../../lib/security/admin-mfa"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (!requireAdminActorId(req)) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Admin authentication is required"
    )
  }

  const config = getStripeEnvConfig()
  const [regions, providerRegistered] = await Promise.all([
    listRegionStripeStatus(req.scope),
    isStripeProviderRegistered(req.scope),
  ])

  const warnings = [...config.warnings]

  if (config.configured && !providerRegistered) {
    warnings.push(
      "STRIPE_API_KEY is set in this process but the Stripe provider is not loaded. Restart the Medusa container."
    )
  }

  res.json({
    configured: config.configured,
    live_mode: config.liveMode,
    live_blocked: config.liveBlocked,
    capture: config.capture,
    automatic_payment_methods: config.automaticPaymentMethods,
    auto_enable_regions: config.autoEnableRegions,
    provider_id: config.providerId,
    provider_registered: providerRegistered,
    secret_key_masked: config.configured
      ? maskCredential(process.env.STRIPE_API_KEY)
      : null,
    publishable_key_configured: config.publishableConfigured,
    webhook_configured: config.webhookConfigured,
    webhook_url: getStripeWebhookUrl(),
    webhook_events: STRIPE_WEBHOOK_EVENTS,
    mode_mismatch: config.modeMismatch,
    warnings,
    regions,
  })
}
