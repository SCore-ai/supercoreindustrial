import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { sendEmail } from "../b2b/email/send-email"
import { emailTemplates } from "../b2b/email/templates"
import { getEmailRuntimeConfig } from "../b2b/settings-email"
import {
  retrieveAbandonedCheckout,
  updateAbandonedCheckoutMetadata,
} from "./abandoned-checkout-service"
import type { AbandonedCheckoutRecoveryEmailStatus } from "./types"

export type SendRecoveryEmailResult = {
  sent: boolean
  error?: string
  hint?: string
  sent_to?: string
  checkout: NonNullable<Awaited<ReturnType<typeof retrieveAbandonedCheckout>>>
}

export async function sendAbandonedCheckoutRecoveryEmail(
  scope: MedusaContainer,
  cartId: string,
  input?: { to?: string | null }
): Promise<SendRecoveryEmailResult> {
  const checkout = await retrieveAbandonedCheckout(scope, cartId)

  if (!checkout) {
    throw new Error("Abandoned checkout not found")
  }

  const recipient = input?.to?.trim() || checkout.email?.trim()

  if (!recipient) {
    throw new Error("This checkout has no customer email address")
  }

  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const config = getEmailRuntimeConfig(settings)

  if (!config.enabled) {
    throw new Error(
      "Email is not configured. Set up SMTP in B2B → Settings → Email first."
    )
  }

  const template = emailTemplates.abandonedCheckoutRecovery(
    {
      customerName: checkout.customer_name,
      checkoutUrl: checkout.checkout_url,
      displayId: checkout.display_id,
      items: checkout.items.map((item) => ({
        title: item.title ?? "Item",
        quantity: item.quantity,
      })),
      total: checkout.total,
      currencyCode: checkout.currency_code,
    },
    settings
  )

  const result = await sendEmail(
    {
      to: recipient,
      subject: template.subject,
      html: template.html,
    },
    settings
  )

  const emailStatus: AbandonedCheckoutRecoveryEmailStatus = result.sent
    ? "sent"
    : "failed"

  await updateAbandonedCheckoutMetadata(scope, cartId, {
    recovery_email: {
      status: emailStatus,
      sent_at: result.sent ? new Date().toISOString() : undefined,
      sent_to: recipient,
      last_error: result.sent ? null : result.error ?? "Send failed",
    },
  })

  const updated = await retrieveAbandonedCheckout(scope, cartId)

  if (!updated) {
    throw new Error("Checkout could not be reloaded after sending email")
  }

  return {
    sent: result.sent,
    error: result.error,
    hint: result.hint,
    sent_to: recipient,
    checkout: updated,
  }
}
