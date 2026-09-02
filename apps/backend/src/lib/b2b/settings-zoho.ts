import { getZohoBooksConfig } from "./zoho-books-client"
import type { B2bModuleSettings, B2bZohoSettingsStatus } from "./settings-types"

const ZOHO_ENV_KEYS = [
  "ZOHO_BOOKS_CLIENT_ID",
  "ZOHO_BOOKS_CLIENT_SECRET",
  "ZOHO_BOOKS_REFRESH_TOKEN",
  "ZOHO_BOOKS_ORGANIZATION_ID",
] as const

export function getZohoSettingsStatus(
  settings: B2bModuleSettings
): B2bZohoSettingsStatus {
  const config = getZohoBooksConfig()
  const missing_env = ZOHO_ENV_KEYS.filter((key) => !process.env[key]?.trim())

  return {
    enabled: process.env.ZOHO_BOOKS_ENABLED === "true",
    configured: Boolean(config),
    sync_on_offer: settings.zoho_sync_on_offer,
    missing_env,
  }
}
