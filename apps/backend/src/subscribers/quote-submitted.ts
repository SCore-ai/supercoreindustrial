import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyQuoteSubmitted } from "../lib/b2b/email/notifications"
import { writeAuditLog } from "../lib/security/audit"

type QuoteSubmittedEvent = {
  id: string
  email?: string | null
  company?: string | null
  company_id?: string | null
  region_id?: string | null
}

export default async function quoteSubmittedHandler({
  event,
  container,
}: SubscriberArgs<QuoteSubmittedEvent>) {
  const logger = container.resolve("logger")

  await notifyQuoteSubmitted(container, {
    quoteId: event.data.id,
    email: event.data.email,
    company: event.data.company,
  })

  await writeAuditLog(container, {
    actor_type: "customer",
    actor_email: event.data.email ?? null,
    action: "quote.submitted",
    resource_type: "quote",
    resource_id: event.data.id,
    company_id: event.data.company_id ?? null,
    summary: `Quote submitted${event.data.company ? ` by ${event.data.company}` : ""}`,
  })

  logger.info(`[b2b] quote.submitted ${event.data.id}`)
}

export const config: SubscriberConfig = {
  event: "quote.submitted",
}
