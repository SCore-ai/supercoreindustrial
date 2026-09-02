import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyRegistrationApproved } from "../lib/b2b/email/notifications"

type CompanyApprovedEvent = {
  id: string
  email?: string
  name?: string
  customer_group_id?: string | null
  primary_customer_id?: string | null
  reset_token?: string | null
  password_setup_url?: string | null
}

export default async function b2bCompanyApprovedHandler({
  event,
  container,
}: SubscriberArgs<CompanyApprovedEvent>) {
  const logger = container.resolve("logger")

  logger.info(
    `[b2b] company.approved ${event.data.id} group=${event.data.customer_group_id ?? "none"}`
  )

  if (!event.data.email || !event.data.name) {
    return
  }

  await notifyRegistrationApproved(container, {
    companyId: event.data.id,
    name: event.data.name,
    email: event.data.email,
    passwordSetupUrl: event.data.password_setup_url,
  })
}

export const config: SubscriberConfig = {
  event: "b2b.company.approved",
}
