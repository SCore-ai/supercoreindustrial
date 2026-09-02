import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyPasswordReset } from "../lib/b2b/email/notifications"

type PasswordResetEvent = {
  entity_id: string
  token: string
  actor_type: string
}

export default async function passwordResetHandler({
  event,
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  const email = event.data.entity_id?.trim()
  const token = event.data.token?.trim()
  const actorType = event.data.actor_type || "customer"

  if (!email || !token) {
    return
  }

  await notifyPasswordReset(container, {
    email,
    token,
    actorType,
  })
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
