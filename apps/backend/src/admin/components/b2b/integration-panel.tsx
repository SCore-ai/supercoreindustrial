import { Button, Heading, Input, Label, Select, Text, Textarea } from "@medusajs/ui"
import { useState } from "react"
import { QuoteErpMetadata } from "../../lib/types"

type IntegrationPanelProps = {
  quoteId: string
  erp?: QuoteErpMetadata
  onSave: (erp: QuoteErpMetadata) => Promise<void>
}

const defaultErp: QuoteErpMetadata = {
  provider: "zoho_books",
  sync_status: "not_configured",
  quote_request_id: "",
  sales_order_id: "",
  purchase_order_id: "",
  error: "",
}

export const IntegrationPanel = ({
  quoteId,
  erp,
  onSave,
}: IntegrationPanelProps) => {
  const [form, setForm] = useState<QuoteErpMetadata>({
    ...defaultErp,
    ...erp,
    provider: erp?.provider ?? "zoho_books",
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    try {
      await onSave({
        ...form,
        quote_request_id: form.quote_request_id || null,
        sales_order_id: form.sales_order_id || null,
        purchase_order_id: form.purchase_order_id || null,
        error: form.error || null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Heading level="h2">ERP integration</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Zoho Books IDs and sync state for quote {quoteId}
          </Text>
        </div>
        <Button size="small" onClick={handleSave} isLoading={saving}>
          Save integration
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="sync_status">Sync status</Label>
          <Select
            value={form.sync_status ?? "not_configured"}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                sync_status: value as QuoteErpMetadata["sync_status"],
              }))
            }
          >
            <Select.Trigger id="sync_status">
              <Select.Value placeholder="Sync status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="not_configured">Not configured</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="synced">Synced</Select.Item>
              <Select.Item value="failed">Failed</Select.Item>
            </Select.Content>
          </Select>
        </div>

        <div>
          <Label htmlFor="quote_request_id">Quote request ID</Label>
          <Input
            id="quote_request_id"
            value={form.quote_request_id ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                quote_request_id: event.target.value,
              }))
            }
            placeholder="Zoho estimate / quote request"
          />
        </div>

        <div>
          <Label htmlFor="sales_order_id">Sales order ID</Label>
          <Input
            id="sales_order_id"
            value={form.sales_order_id ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sales_order_id: event.target.value,
              }))
            }
            placeholder="Zoho sales order"
          />
        </div>

        <div>
          <Label htmlFor="purchase_order_id">Purchase order ID</Label>
          <Input
            id="purchase_order_id"
            value={form.purchase_order_id ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                purchase_order_id: event.target.value,
              }))
            }
            placeholder="Zoho purchase order"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="error">Last sync error</Label>
          <Textarea
            id="error"
            value={form.error ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                error: event.target.value,
              }))
            }
            placeholder="Optional error message from ERP sync"
          />
        </div>
      </div>
    </div>
  )
}

export default IntegrationPanel
