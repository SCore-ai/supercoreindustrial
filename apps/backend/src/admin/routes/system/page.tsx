import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const SystemIndexPage = () => (
  <Container className="flex flex-col gap-y-4 p-6">
    <Heading level="h1">System</Heading>
    <Text size="small" className="text-ui-fg-subtle">
      Platform configuration, extensions, and security controls.
    </Text>
    <div className="flex flex-col gap-2">
      <Link
        to="/catalog"
        className="text-ui-fg-interactive hover:underline"
      >
        Catalog
      </Link>
      <Link
        to="/system/extensions"
        className="text-ui-fg-interactive hover:underline"
      >
        Extensions
      </Link>
      <Link
        to="/system/payments"
        className="text-ui-fg-interactive hover:underline"
      >
        Payments
      </Link>
      <Link
        to="/system/security"
        className="text-ui-fg-interactive hover:underline"
      >
        Security
      </Link>
    </div>
  </Container>
)
export const config = defineRouteConfig({
  label: "System",
})

export default SystemIndexPage
