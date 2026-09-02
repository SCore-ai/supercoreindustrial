import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import { Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"
import { StripeSettingsPanel } from "../../../components/security/stripe-settings-panel"

const SystemPaymentsPage = () => (
  <Container className="flex flex-col gap-y-4 p-6">
    <div>
      <Heading level="h1">Payments</Heading>
      <Text size="small" className="text-ui-fg-subtle">
        Stripe is the card provider for Super Core Industrial. Keys stay in
        environment variables; this screen only shows masked status and enables
        the provider on every region.
      </Text>
    </div>

    <div className="rounded-lg border border-ui-border-base p-4">
      <Heading level="h2">Setup</Heading>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-ui-fg-subtle">
        <li>
          <Text size="xsmall">
            In the Stripe Dashboard, copy the Secret key into{" "}
            <code>apps/backend/.env</code> as <code>STRIPE_API_KEY</code>. Never
            paste it here.
          </Text>
        </li>
        <li>
          <Text size="xsmall">
            Copy the Publishable key into <code>apps/storefront/.env</code> as{" "}
            <code>NEXT_PUBLIC_STRIPE_KEY</code>. Test and live keys must match.
          </Text>
        </li>
        <li>
          <Text size="xsmall">
            Add a webhook endpoint for the URL below. Events:{" "}
            <code>payment_intent.amount_capturable_updated</code>,{" "}
            <code>payment_intent.succeeded</code>,{" "}
            <code>payment_intent.payment_failed</code>,{" "}
            <code>payment_intent.partially_funded</code>. Put the signing secret
            in <code>STRIPE_WEBHOOK_SECRET</code>.
          </Text>
        </li>
        <li>
          <Text size="xsmall">
            Restart Medusa and the storefront (
            <code>docker compose restart medusa storefront</code>
            ), then enable Stripe on regions.
          </Text>
        </li>
      </ol>
      <StripeSettingsPanel />
    </div>

    <Text size="xsmall" className="text-ui-fg-subtle">
      Native Medusa region editor:{" "}
      <Link to="/settings/regions" className="text-ui-fg-interactive hover:underline">
        Settings → Regions
      </Link>
      . PCI posture also appears under{" "}
      <Link to="/system/security" className="text-ui-fg-interactive hover:underline">
        System → Security
      </Link>
      .
    </Text>
  </Container>
)

export const config = defineRouteConfig({
  label: "Payments",
  icon: CreditCard,
})

export default SystemPaymentsPage
