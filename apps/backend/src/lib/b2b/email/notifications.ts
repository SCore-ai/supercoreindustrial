import { MedusaContainer } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../modules/b2b"
import B2bModuleService from "../../../modules/b2b/service"
import type { B2bModuleSettings } from "../settings-types"
import { getEmailRuntimeConfig, getEmailSettingsStatus } from "../settings-email"
import {
  loadQuoteEmailPayload,
  resolveConversationCustomerEmail,
} from "./quote-email-data"
import { generateOfferPdf } from "../offer-pdf/load-offer-pdf"
import { sendEmail } from "./send-email"
import { emailTemplates } from "./templates"
import { buildPasswordResetUrl } from "../password-reset"

type NotificationLogger = {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
}

const recentPasswordResetTokens = new Map<string, number>()
const PASSWORD_RESET_DEDUPE_MS = 20_000

function alreadySentPasswordReset(token: string) {
  const now = Date.now()
  const previous = recentPasswordResetTokens.get(token)

  if (previous && now - previous < PASSWORD_RESET_DEDUPE_MS) {
    return true
  }

  recentPasswordResetTokens.set(token, now)

  if (recentPasswordResetTokens.size > 200) {
    for (const [key, at] of recentPasswordResetTokens) {
      if (now - at > PASSWORD_RESET_DEDUPE_MS) {
        recentPasswordResetTokens.delete(key)
      }
    }
  }

  return false
}

async function deliver(
  logger: NotificationLogger,
  settings: B2bModuleSettings,
  type: string,
  to: string | string[],
  subject: string,
  html: string,
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
) {
  const config = getEmailRuntimeConfig(settings)

  if (!config.enabled) {
    const status = getEmailSettingsStatus(settings)
    logger.info(
      `[b2b-email] ${type} skipped — email not configured (${status.missing_fields.join(", ") || "disabled"})`
    )
    return
  }

  try {
    const result = await sendEmail({ to, subject, html, attachments }, settings)

    if (!result.sent) {
      logger.error(
        `[b2b-email] ${type} failed: ${result.error ?? "unknown error"}${result.hint ? ` — ${result.hint}` : ""}`
      )
      return
    }

    logger.info(
      `[b2b-email] ${type} sent to ${Array.isArray(to) ? to.join(", ") : to}`
    )
  } catch (error) {
    logger.error(
      `[b2b-email] ${type} failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export async function notifyRegistrationCreated(
  scope: MedusaContainer,
  input: { companyId: string; name: string; email: string }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  if (!settings.notify_on_registration) {
    return
  }

  const config = getEmailRuntimeConfig(settings)
  const template = emailTemplates.registrationAdmin(
    {
      companyName: input.name,
      email: input.email,
      companyId: input.companyId,
    },
    settings
  )

  await deliver(
    logger,
    settings,
    "registration",
    config.admin,
    template.subject,
    template.html
  )
}

export async function notifyAdminMfaChallenge(
  scope: MedusaContainer,
  input: { email: string; code: string }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger
  const template = emailTemplates.adminMfaChallenge(input, settings)
  const result = await sendEmail(
    {
      to: input.email,
      subject: template.subject,
      html: template.html,
    },
    settings
  )

  if (!result.sent) {
    logger.error(
      `[b2b-email] admin_mfa_challenge failed: ${result.error ?? "unknown error"}${result.hint ? ` — ${result.hint}` : ""}`
    )
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      result.error ||
        "Admin MFA email could not be sent. Check B2B SMTP settings."
    )
  }

  logger.info(`[b2b-email] admin_mfa_challenge sent to ${input.email}`)
}

export async function notifyMfaChallenge(
  scope: MedusaContainer,
  input: { email: string; code: string }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  const template = emailTemplates.mfaChallenge(input, settings)

  await deliver(
    logger,
    settings,
    "mfa_challenge",
    input.email,
    template.subject,
    template.html
  )
}

export async function notifyTradeRegistrationVerification(
  scope: MedusaContainer,
  input: { email: string; code: string }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  const template = emailTemplates.tradeRegistrationVerification(input, settings)

  await deliver(
    logger,
    settings,
    "trade_verification",
    input.email,
    template.subject,
    template.html
  )
}

export async function notifyRegistrationReceived(
  scope: MedusaContainer,
  input: { companyName: string; email: string }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  const template = emailTemplates.registrationReceivedCustomer(
    { companyName: input.companyName },
    settings
  )

  await deliver(
    logger,
    settings,
    "registration_received",
    input.email,
    template.subject,
    template.html
  )
}

export async function notifyB2bAccessInvite(
  scope: MedusaContainer,
  input: {
    companyName: string
    email: string
    role?: string | null
    passwordSetupUrl?: string | null
    storefrontUrl?: string
  }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  const template = emailTemplates.b2bAccessInvite(input, settings)

  await deliver(
    logger,
    settings,
    "b2b_access_invite",
    input.email,
    template.subject,
    template.html
  )
}

export async function notifyQuoteSubmitted(
  scope: MedusaContainer,
  input: {
    quoteId: string
    email?: string | null
    company?: string | null
  }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  if (!settings.notify_on_quote_submit) {
    return
  }

  const config = getEmailRuntimeConfig(settings)
  const quote = (await loadQuoteEmailPayload(scope, input.quoteId)) ?? {
    quote_id: input.quoteId,
    email: input.email ?? null,
    company: input.company ?? null,
    project: null,
    notes: null,
    currency_code: "gbp",
    created_at: new Date().toISOString(),
    items: [],
    item_count: 0,
    subtotal: null,
  }

  const adminTemplate = emailTemplates.quoteSubmitAdmin(quote, settings)

  await deliver(
    logger,
    settings,
    "quote_submit_admin",
    config.admin,
    adminTemplate.subject,
    adminTemplate.html
  )

  const customerEmail = quote.email?.trim() || input.email?.trim()

  if (customerEmail) {
    const customerTemplate = emailTemplates.quoteSubmitCustomer(quote, settings)

    await deliver(
      logger,
      settings,
      "quote_submit_customer",
      customerEmail,
      customerTemplate.subject,
      customerTemplate.html
    )
  } else {
    logger.warn(
      `[b2b-email] quote_submit_customer skipped — no customer email on quote ${input.quoteId}`
    )
  }
}

export async function notifyOfferSent(
  scope: MedusaContainer,
  input: {
    quoteId: string
    email?: string | null
    company?: string | null
    offerTotal?: number | null
    currencyCode?: string | null
  }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  if (!settings.notify_on_offer_sent || !input.email?.trim()) {
    return
  }

  const quote = await loadQuoteEmailPayload(scope, input.quoteId)
  const template = emailTemplates.offerSentCustomer(
    {
      quoteId: input.quoteId,
      email: input.email.trim(),
      company: input.company ?? quote?.company,
      offerTotal: input.offerTotal,
      currencyCode: input.currencyCode,
      quote,
    },
    settings
  )

  let attachments:
    | Array<{ filename: string; content: Buffer; contentType?: string }>
    | undefined

  try {
    const pdf = await generateOfferPdf(scope, input.quoteId)
    attachments = [
      {
        filename: pdf.document.filename,
        content: pdf.buffer,
        contentType: "application/pdf",
      },
    ]
  } catch (error) {
    logger.warn(
      `[b2b-email] offer PDF attachment skipped: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  await deliver(
    logger,
    settings,
    "offer_sent",
    input.email.trim(),
    template.subject,
    template.html,
    attachments
  )
}

export async function notifyConversationReply(
  scope: MedusaContainer,
  input: {
    conversationId: string
    body: string
    senderName?: string | null
  }
): Promise<boolean> {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  const conversation = await b2bService.retrieveB2bConversation(
    input.conversationId
  )

  const customerEmail = await resolveConversationCustomerEmail(scope, {
    quote_id: conversation.quote_id,
    company_id: conversation.company_id,
    customer_id: conversation.customer_id,
  })

  if (!customerEmail) {
    logger.warn(
      `[b2b-email] conversation_reply skipped — no customer email for ${input.conversationId}`
    )
    return false
  }

  const template = emailTemplates.conversationReplyCustomer(
    {
      subject: conversation.subject,
      body: input.body,
      senderName: input.senderName,
      conversationId: conversation.id,
      quoteId: conversation.quote_id,
    },
    settings
  )

  const config = getEmailRuntimeConfig(settings)

  if (!config.enabled) {
    const status = getEmailSettingsStatus(settings)
    logger.info(
      `[b2b-email] conversation_reply skipped — email not configured (${status.missing_fields.join(", ") || "disabled"})`
    )
    return false
  }

  try {
    const result = await sendEmail(
      {
        to: customerEmail,
        subject: template.subject,
        html: template.html,
      },
      settings
    )

    if (!result.sent) {
      logger.error(
        `[b2b-email] conversation_reply failed: ${result.error ?? "unknown error"}${result.hint ? ` — ${result.hint}` : ""}`
      )
      return false
    }

    logger.info(`[b2b-email] conversation_reply sent to ${customerEmail}`)
    return true
  } catch (error) {
    logger.error(
      `[b2b-email] conversation_reply failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
    return false
  }
}

export async function notifyPasswordReset(
  scope: MedusaContainer,
  input: {
    email: string
    token: string
    actorType: string
  }
): Promise<{ sent: boolean; error?: string; resetUrl: string }> {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger
  const resetUrl = buildPasswordResetUrl(
    input.actorType,
    input.token,
    input.email
  )

  if (alreadySentPasswordReset(input.token)) {
    logger.info(
      `[b2b-email] password_reset skipped duplicate token for ${input.email}`
    )
    return { sent: true, resetUrl }
  }

  const template = emailTemplates.passwordReset(
    {
      email: input.email,
      resetUrl,
      actorType: input.actorType,
    },
    settings
  )

  const config = getEmailRuntimeConfig(settings)

  if (!config.enabled) {
    const status = getEmailSettingsStatus(settings)
    logger.info(
      `[b2b-email] password_reset skipped — email not configured (${status.missing_fields.join(", ") || "disabled"})`
    )
    return {
      sent: false,
      error: `Email is not configured (${status.missing_fields.join(", ") || "disabled"})`,
      resetUrl,
    }
  }

  const result = await sendEmail(
    {
      to: input.email,
      subject: template.subject,
      html: template.html,
    },
    settings
  )

  if (!result.sent) {
    logger.error(
      `[b2b-email] password_reset failed: ${result.error ?? "unknown error"}${result.hint ? ` — ${result.hint}` : ""}`
    )
    return {
      sent: false,
      error: result.error ?? "Failed to send password reset email",
      resetUrl,
    }
  }

  logger.info(`[b2b-email] password_reset sent to ${input.email}`)
  return { sent: true, resetUrl }
}

export async function notifyRegistrationApproved(
  scope: MedusaContainer,
  input: {
    companyId: string
    name: string
    email: string
    passwordSetupUrl?: string | null
  }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  if (!input.email?.trim()) {
    return
  }

  const template = emailTemplates.registrationApprovedCustomer(
    {
      companyName: input.name,
      email: input.email.trim(),
      passwordSetupUrl: input.passwordSetupUrl,
    },
    settings
  )

  await deliver(
    logger,
    settings,
    "registration_approved",
    input.email.trim(),
    template.subject,
    template.html
  )
}

export async function notifyOrderApprovalPending(
  scope: MedusaContainer,
  input: {
    orderId: string
    companyId: string
    approvalId: string
  }
) {
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const logger = scope.resolve("logger") as NotificationLogger

  if (!settings.notify_on_order_approval) {
    return
  }

  const company = await b2bService.retrieveB2bCompany(input.companyId)
  const config = getEmailRuntimeConfig(settings)
  const adminTemplate = emailTemplates.orderApprovalAdmin(
    {
      orderId: input.orderId,
      companyName: company.name,
      approvalId: input.approvalId,
    },
    settings
  )

  await deliver(
    logger,
    settings,
    "order_approval",
    config.admin,
    adminTemplate.subject,
    adminTemplate.html
  )

  if (company.email?.trim()) {
    const customerTemplate = emailTemplates.orderApprovalCustomer(
      {
        orderId: input.orderId,
        companyName: company.name,
      },
      settings
    )

    await deliver(
      logger,
      settings,
      "order_approval_customer",
      company.email.trim(),
      customerTemplate.subject,
      customerTemplate.html
    )
  }
}
