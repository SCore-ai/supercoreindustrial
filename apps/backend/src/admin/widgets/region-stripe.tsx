import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { StripeSettingsPanel } from "../components/security/stripe-settings-panel"

const RegionStripeWidget = () => (
  <Container className="divide-y p-0">
    <div className="px-6 py-4">
      <Heading level="h2">Stripe payments</Heading>
      <Text size="xsmall" className="mb-3 text-ui-fg-subtle">
        Card checkout uses Stripe Payment Element. Enable the provider on this
        region (and every other region) from here.
      </Text>
      <StripeSettingsPanel compact />
    </div>
  </Container>
)

export const config = defineWidgetConfig({
  zone: "region.details",
})

export default RegionStripeWidget
