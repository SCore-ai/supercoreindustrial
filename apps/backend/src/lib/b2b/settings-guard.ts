import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import type { B2bModuleSettings } from "./settings-types"

type FeatureKey =
  | "conversations_enabled"
  | "quotes_enabled"
  | "order_approval_enabled"
  | "tiered_pricing_enabled"
  | "purchase_lists_enabled"
  | "bulk_order_form_enabled"

const FEATURE_LABELS: Record<FeatureKey, string> = {
  conversations_enabled: "Conversations",
  quotes_enabled: "Quotes & offers",
  order_approval_enabled: "Order approval",
  tiered_pricing_enabled: "Tiered pricing",
  purchase_lists_enabled: "Purchase lists",
  bulk_order_form_enabled: "Bulk order form",
}

export async function getB2bSettings(
  scope: { resolve: (key: string) => unknown }
): Promise<B2bModuleSettings> {
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  return b2bService.getSettings()
}

export async function requireB2bFeature(
  scope: { resolve: (key: string) => unknown },
  feature: FeatureKey
): Promise<B2bModuleSettings> {
  const settings = await getB2bSettings(scope)

  if (!settings[feature]) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `B2B feature "${FEATURE_LABELS[feature]}" is disabled in Settings`
    )
  }

  return settings
}

export function allowsDedicatedRegistration(settings: B2bModuleSettings) {
  return (
    settings.registration_mode === "dedicated_form" ||
    settings.registration_mode === "both"
  )
}

export function allowsQuoteRegistration(settings: B2bModuleSettings) {
  return (
    settings.registration_mode === "quote_submit" ||
    settings.registration_mode === "both"
  )
}
