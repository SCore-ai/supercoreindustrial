import type { B2bModuleSettings } from "../settings-types"
import { getEmailRuntimeConfig, getEmailSettingsStatus } from "../settings-email"
import {
  createSmtpTransporter,
  describeSmtpError,
  getSmtpTransportSummary,
} from "./smtp-transport"

export type B2bEmailTestResult = {
  success: boolean
  stage: "config" | "verify" | "send"
  message: string
  error?: string
  hint?: string
  config?: {
    host: string
    port: number
    secure: boolean
    require_tls: boolean
    from: string
    auth_configured: boolean
  }
}

function buildConfigFailure(settings: B2bModuleSettings): B2bEmailTestResult {
  const status = getEmailSettingsStatus(settings)
  const missing = status.missing_fields.join(", ")

  return {
    success: false,
    stage: "config",
    message: "Email is not fully configured",
    error: missing || "email_enabled is false",
    hint: "Enable email notifications and fill in From, Merchant inbox, and SMTP host, then save.",
  }
}

function buildConfigSummary(settings: B2bModuleSettings) {
  const config = getEmailRuntimeConfig(settings)
  const summary = getSmtpTransportSummary(config)

  if (!summary) {
    return null
  }

  return {
    ...summary,
    from: config.from,
  }
}

export async function verifyEmailConnection(
  settings: B2bModuleSettings
): Promise<B2bEmailTestResult> {
  const config = getEmailRuntimeConfig(settings)
  const configSummary = buildConfigSummary(settings)

  if (!config.enabled || !config.smtp) {
    return buildConfigFailure(settings)
  }

  const transporter = createSmtpTransporter(config)

  if (!transporter) {
    return buildConfigFailure(settings)
  }

  try {
    await transporter.verify()

    return {
      success: true,
      stage: "verify",
      message: "SMTP connection and authentication succeeded",
      config: configSummary ?? undefined,
    }
  } catch (error) {
    const described = describeSmtpError(error)

    return {
      success: false,
      stage: "verify",
      message: "SMTP connection failed",
      error: described.message,
      hint: described.hint,
      config: configSummary ?? undefined,
    }
  }
}

export async function sendTestEmail(
  settings: B2bModuleSettings,
  to: string
): Promise<B2bEmailTestResult> {
  const verifyResult = await verifyEmailConnection(settings)

  if (!verifyResult.success) {
    return verifyResult
  }

  const config = getEmailRuntimeConfig(settings)
  const transporter = createSmtpTransporter(config)

  if (!transporter) {
    return buildConfigFailure(settings)
  }

  const recipient = to.trim()

  if (!recipient) {
    return {
      success: false,
      stage: "config",
      message: "Recipient email is required",
      hint: "Enter an inbox address to receive the test message.",
    }
  }

  try {
    await transporter.sendMail({
      from: config.from,
      to: recipient,
      subject: "B2B Module — SMTP test email",
      html: `
        <p>This is a test email from the Supercore Industrial B2B Module.</p>
        <p>If you received this message, SMTP delivery and domain authentication are working for outbound mail.</p>
        <p style="color:#64748b;font-size:12px;margin-top:24px;">
          Sent at ${new Date().toISOString()} via ${config.smtp?.host}:${config.smtp?.port}
        </p>
      `,
      text: `B2B Module SMTP test — sent at ${new Date().toISOString()}`,
    })

    return {
      success: true,
      stage: "send",
      message: `Test email sent to ${recipient}`,
      config: verifyResult.config,
    }
  } catch (error) {
    const described = describeSmtpError(error)

    return {
      success: false,
      stage: "send",
      message: "Test email could not be sent",
      error: described.message,
      hint: described.hint,
      config: verifyResult.config,
    }
  }
}
