import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import type { B2bEmailRuntimeConfig } from "../settings-email"

export type SmtpTransportSummary = {
  host: string
  port: number
  secure: boolean
  require_tls: boolean
  auth_configured: boolean
}

export function resolveSmtpSecure(port: number, explicitSecure?: boolean): boolean {
  if (port === 465) {
    return true
  }

  if (port === 587 || port === 25 || port === 2525) {
    return false
  }

  return explicitSecure === true
}

export function buildSmtpTransportOptions(
  config: B2bEmailRuntimeConfig
): SMTPTransport.Options | null {
  if (!config.smtp) {
    return null
  }

  const port = config.smtp.port
  const secure = resolveSmtpSecure(port, config.smtp.secure)
  const requireTLS = port === 587 && !secure

  return {
    host: config.smtp.host,
    port,
    secure,
    requireTLS,
    auth:
      config.smtp.user && config.smtp.pass
        ? {
            user: config.smtp.user,
            pass: config.smtp.pass,
          }
        : undefined,
  }
}

export function getSmtpTransportSummary(
  config: B2bEmailRuntimeConfig
): SmtpTransportSummary | null {
  if (!config.smtp) {
    return null
  }

  const port = config.smtp.port
  const secure = resolveSmtpSecure(port, config.smtp.secure)

  return {
    host: config.smtp.host,
    port,
    secure,
    require_tls: port === 587 && !secure,
    auth_configured: Boolean(config.smtp.user && config.smtp.pass),
  }
}

export function createSmtpTransporter(config: B2bEmailRuntimeConfig) {
  const options = buildSmtpTransportOptions(config)

  if (!options) {
    return null
  }

  return nodemailer.createTransport(options)
}

export function describeSmtpError(error: unknown): { message: string; hint?: string } {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()

  if (normalized.includes("wrong version number")) {
    return {
      message,
      hint:
        "Port 587 uses STARTTLS — turn off “Implicit SSL (port 465)” or set port to 465 for SSL-on-connect.",
    }
  }

  if (normalized.includes("authentication") || normalized.includes("auth")) {
    return {
      message,
      hint: "Check SMTP username and password. Some providers require an app-specific password.",
    }
  }

  if (normalized.includes("enotfound") || normalized.includes("getaddrinfo")) {
    return {
      message,
      hint: "SMTP host could not be resolved. Check the hostname spelling.",
    }
  }

  if (normalized.includes("connection") || normalized.includes("timeout")) {
    return {
      message,
      hint: "Could not reach the SMTP server. Check host, port, and firewall rules.",
    }
  }

  return { message }
}
