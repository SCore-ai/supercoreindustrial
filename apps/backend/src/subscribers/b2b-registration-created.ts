import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyRegistrationCreated } from "../lib/b2b/email/notifications"

type RegistrationCreatedEvent = {
  id: string
  name: string
  email: string
}

export default async function b2bRegistrationCreatedHandler({
  event,
  container,
}: SubscriberArgs<RegistrationCreatedEvent>) {
  await notifyRegistrationCreated(container, {
    companyId: event.data.id,
    name: event.data.name,
    email: event.data.email,
  })
}

export const config: SubscriberConfig = {
  event: "b2b.registration.created",
}
