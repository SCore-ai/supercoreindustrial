import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { B2B_MODULE } from "../modules/b2b"
import B2bModuleService from "../modules/b2b/service"
import { notifyOfferSent } from "../lib/b2b/email/notifications"
import { syncQuoteOfferToZoho } from "../lib/b2b/zoho-sync"
import { writeAuditLog } from "../lib/security/audit"

type QuoteOfferSentEvent = {
  id: string
  email?: string | null
  company_id?: string | null
  offer_total?: number | null
  currency_code?: string | null
}
export default async function quoteOfferSentHandler({
  event,
  container,
}: SubscriberArgs<QuoteOfferSentEvent>) {
  const logger = container.resolve("logger")
  const b2bService: B2bModuleService = container.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()

  if (!settings.zoho_sync_on_offer) {
    logger.info(
      `[b2b] quote.offer.sent ${event.data.id} — Zoho sync disabled in Settings`
    )
  } else {
    try {
      await syncQuoteOfferToZoho(container, event.data.id)
    } catch (error) {
      logger.error(
        `[b2b] quote.offer.sent Zoho sync failed for ${event.data.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  await notifyOfferSent(container, {
    quoteId: event.data.id,
    email: event.data.email,
    offerTotal: event.data.offer_total,
    currencyCode: event.data.currency_code,
  })

  await writeAuditLog(container, {
    actor_type: "admin",
    actor_email: event.data.email ?? null,
    action: "quote.offer.sent",
    resource_type: "quote",
    resource_id: event.data.id,
    company_id: event.data.company_id ?? null,
    summary: `Offer sent for quote ${event.data.id}`,
  })
}

export const config: SubscriberConfig = {
  event: "quote.offer.sent",
}
