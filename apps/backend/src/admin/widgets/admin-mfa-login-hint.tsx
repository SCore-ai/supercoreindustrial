import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Text } from "@medusajs/ui"
import "../lib/admin-mfa-fetch-guard"

const AdminMfaLoginHint = () => (
  <Text size="small" className="mt-4 text-ui-fg-subtle">
    After you sign in, a 6-digit code is emailed to
    service@supercoresystems.co.uk. Enter that code to open the dashboard.
  </Text>
)

export const config = defineWidgetConfig({
  zone: "login.after",
  id: "supercore.admin-mfa-login-hint",
})

export default AdminMfaLoginHint
