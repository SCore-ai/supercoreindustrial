import type { B2bEmailSettingsStatus, B2bModuleSettings } from "./settings-types"
import { DEFAULT_ADMIN_EMAIL } from "./admin-email"

export type B2bEmailRuntimeConfig = {
  enabled: boolean
  from: string
  admin: string
  adminUrl: string
  storefrontUrl: string
  smtp: {
    host: string
    port: number
    secure: boolean
    user?: string
    pass?: string
  } | null
}

function readText(
  settings: B2bModuleSettings | undefined,
  dbKey: keyof B2bModuleSettings,
  envKey: string
): string {
  const dbValue = settings?.[dbKey]

  if (typeof dbValue === "string" && dbValue.trim()) {
    return dbValue.trim()
  }

  return process.env[envKey]?.trim() ?? ""
}

function readSmtpPass(settings?: B2bModuleSettings): string | undefined {
  const dbValue = settings?.smtp_pass?.trim()

  if (dbValue) {
    return dbValue
  }

  return process.env.SMTP_PASS?.trim() || undefined
}

export function getEmailRuntimeConfig(
  settings?: B2bModuleSettings
): B2bEmailRuntimeConfig {
  const host = readText(settings, "smtp_host", "SMTP_HOST")
  const from =
    readText(settings, "email_from", "B2B_EMAIL_FROM") || DEFAULT_ADMIN_EMAIL
  const admin =
    readText(settings, "email_admin", "B2B_EMAIL_ADMIN") || DEFAULT_ADMIN_EMAIL
  const user = readText(settings, "smtp_user", "SMTP_USER") || undefined
  const pass = readSmtpPass(settings)
  const enabledFromDb = settings?.email_enabled
  const enabledFromEnv = process.env.B2B_EMAIL_ENABLED === "true"
  const flagEnabled =
    enabledFromDb === true || (enabledFromDb == null && enabledFromEnv)
  const configured = Boolean(host && from && admin)
  const port =
    settings?.smtp_port && settings.smtp_port > 0
      ? settings.smtp_port
      : Number(process.env.SMTP_PORT ?? 587)
  const secure =
    settings?.smtp_secure === true || process.env.SMTP_SECURE === "true"

  return {
    enabled: flagEnabled && configured,
    from,
    admin,
    adminUrl: process.env.ADMIN_URL?.trim() ?? "http://localhost:9000/app",
    storefrontUrl:
      process.env.STOREFRONT_URL?.trim() ?? "http://localhost:8000",
    smtp: host
      ? {
          host,
          port,
          secure,
          user,
          pass,
        }
      : null,
  }
}

export function getEmailSettingsStatus(
  settings: B2bModuleSettings
): B2bEmailSettingsStatus {
  const config = getEmailRuntimeConfig(settings)
  const missing_fields: string[] = []

  if (!settings.email_enabled) {
    missing_fields.push("email_enabled")
  }

  if (!config.from) {
    missing_fields.push("email_from")
  }

  if (!config.admin) {
    missing_fields.push("email_admin")
  }

  if (!config.smtp?.host) {
    missing_fields.push("smtp_host")
  }

  return {
    enabled: settings.email_enabled,
    configured: config.enabled,
    smtp_pass_set: Boolean(readSmtpPass(settings)),
    missing_fields,
  }
}

export function sanitizeSettingsForAdmin(
  settings: B2bModuleSettings
): Omit<B2bModuleSettings, "smtp_pass"> {
  const { smtp_pass: _smtpPass, ...rest } = settings
  return rest
}
