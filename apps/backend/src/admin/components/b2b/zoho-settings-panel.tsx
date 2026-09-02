import { Badge, Heading, Text } from "@medusajs/ui"
import type { B2bZohoSettingsStatus } from "../../lib/types"
import { SettingsEnvKeys } from "./settings-env-keys"
import { SettingsToggleRow } from "./settings-toggle-row"

type ZohoSettingsPanelProps = {
  zoho: B2bZohoSettingsStatus
  syncOnOffer: boolean
  onSyncOnOfferChange: (value: boolean) => void
}

export const ZohoSettingsPanel = ({
  zoho,
  syncOnOffer,
  onSyncOnOfferChange,
}: ZohoSettingsPanelProps) => (
  <section className="rounded-xl border border-ui-border-base p-5">
    <Heading level="h2" className="mb-1">
      Zoho Books
    </Heading>
    <Text size="small" className="mb-4 text-ui-fg-subtle">
      Sync estimates when priced offers are sent. OAuth credentials stay in
      backend environment variables.
    </Text>

    <div className="mb-4 flex flex-wrap gap-2">
      <Badge color={zoho.enabled ? "green" : "grey"} size="2xsmall">
        {zoho.enabled ? "Enabled in env" : "Not enabled"}
      </Badge>
      <Badge color={zoho.configured ? "green" : "orange"} size="2xsmall">
        {zoho.configured ? "Configured" : "Missing credentials"}
      </Badge>
    </div>

    <SettingsToggleRow
      label="Sync estimate on offer send"
      description="Uses quote.offer.sent subscriber"
      checked={syncOnOffer}
      onChange={onSyncOnOfferChange}
    />

    <div className="mt-4">
      <SettingsEnvKeys
        envFile="apps/backend/.env"
        keys={[
          "ZOHO_BOOKS_ENABLED",
          "ZOHO_BOOKS_CLIENT_ID",
          "ZOHO_BOOKS_CLIENT_SECRET",
          "ZOHO_BOOKS_REFRESH_TOKEN",
          "ZOHO_BOOKS_ORGANIZATION_ID",
        ].map((key) => ({
          key,
          set: !zoho.missing_env.includes(key),
        }))}
      />
    </div>
  </section>
)
