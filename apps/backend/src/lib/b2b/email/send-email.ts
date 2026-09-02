import type { B2bEmailRuntimeConfig } from "../settings-email"
import { getEmailRuntimeConfig } from "../settings-email"
import type { B2bModuleSettings } from "../settings-types"
import {
  createSmtpTransporter,
  describeSmtpError,
} from "./smtp-transport"

export type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
}

export type SendEmailResult = {
  sent: boolean
  error?: string
  hint?: string
}

export async function sendEmail(
  input: SendEmailInput,
  settings?: B2bModuleSettings
): Promise<SendEmailResult> {
  const config = settings
    ? getEmailRuntimeConfig(settings)
    : getEmailRuntimeConfig()

  return sendEmailWithConfig(input, config)
}

export async function sendEmailWithConfig(
  input: SendEmailInput,
  config: B2bEmailRuntimeConfig
): Promise<SendEmailResult> {
  if (!config.enabled || !config.smtp) {
    return { sent: false, error: "Email is not configured or disabled" }
  }

  const transporter = createSmtpTransporter(config)

  if (!transporter) {
    return { sent: false, error: "SMTP transport could not be created" }
  }

  try {
    await transporter.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? stripHtml(input.html),
      attachments: input.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType ?? "application/octet-stream",
      })),
    })

    return { sent: true }
  } catch (error) {
    const described = describeSmtpError(error)

    return {
      sent: false,
      error: described.message,
      hint: described.hint,
    }
  }
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}
