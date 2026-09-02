import { Button, Heading, Input, Label, Table, Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { AdminQuoteLineItem } from "../../lib/types"

type QuoteOfferEditorProps = {
  quoteId: string
  items: AdminQuoteLineItem[]
  currencyCode?: string | null
  validUntil?: string | null
  offerTotal?: number | null
  onSend: (payload: {
    currency_code?: string | null
    valid_until?: string | null
    line_items: Array<{
      id: string
      unit_price?: number | null
      discount_percent?: number
    }>
  }) => Promise<void>
}

type LineDraft = {
  id: string
  unit_price: string
  discount_percent: string
}

export const QuoteOfferEditor = ({
  items,
  currencyCode,
  validUntil,
  offerTotal,
  onSend,
}: QuoteOfferEditorProps) => {
  const [currency, setCurrency] = useState(currencyCode ?? "gbp")
  const [validUntilValue, setValidUntilValue] = useState(
    validUntil ? validUntil.slice(0, 10) : ""
  )
  const [lines, setLines] = useState<LineDraft[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLines(
      items.map((item) => ({
        id: item.id,
        unit_price:
          item.unit_price != null ? String(item.unit_price) : "",
        discount_percent:
          item.discount_percent != null
            ? String(item.discount_percent)
            : "0",
      }))
    )
  }, [items])

  const computedTotal = useMemo(() => {
    let total = 0
    let hasPricing = false

    for (const line of lines) {
      const unitPrice = parseFloat(line.unit_price)
      const discount = parseFloat(line.discount_percent || "0")

      if (Number.isNaN(unitPrice)) {
        continue
      }

      const item = items.find((entry) => entry.id === line.id)
      if (!item) {
        continue
      }

      hasPricing = true
      total +=
        unitPrice * (1 - (Number.isNaN(discount) ? 0 : discount) / 100) *
        item.quantity
    }

    return hasPricing ? Math.round(total * 100) / 100 : null
  }, [items, lines])

  const handleSend = async () => {
    setSaving(true)

    try {
      await onSend({
        currency_code: currency,
        valid_until: validUntilValue || null,
        line_items: lines.map((line) => ({
          id: line.id,
          unit_price: line.unit_price ? parseFloat(line.unit_price) : null,
          discount_percent: parseFloat(line.discount_percent || "0"),
        })),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-ui-border-base bg-ui-bg-base p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <Heading level="h2">Quote offer</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            B2B Module priced response — set unit prices and send offer
          </Text>
        </div>
        <Button size="small" onClick={handleSend} isLoading={saving}>
          Send offer
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="offer_currency">Currency</Label>
          <Input
            id="offer_currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value.toLowerCase())}
          />
        </div>
        <div>
          <Label htmlFor="offer_valid_until">Valid until</Label>
          <Input
            id="offer_valid_until"
            type="date"
            value={validUntilValue}
            onChange={(event) => setValidUntilValue(event.target.value)}
          />
        </div>
        <div>
          <Label>Offer total</Label>
          <Text weight="plus" className="mt-2 block text-lg">
            {computedTotal != null
              ? `${computedTotal.toFixed(2)} ${currency.toUpperCase()}`
              : offerTotal != null
                ? `${offerTotal.toFixed(2)} ${currency.toUpperCase()}`
                : "—"}
          </Text>
        </div>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Product</Table.HeaderCell>
            <Table.HeaderCell>Qty</Table.HeaderCell>
            <Table.HeaderCell>Unit price</Table.HeaderCell>
            <Table.HeaderCell>Discount %</Table.HeaderCell>
            <Table.HeaderCell>Line total</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => {
            const draft = lines.find((line) => line.id === item.id)
            const unitPrice = parseFloat(draft?.unit_price ?? "")
            const discount = parseFloat(draft?.discount_percent ?? "0")
            const lineTotal =
              !Number.isNaN(unitPrice) && draft
                ? Math.round(
                    unitPrice *
                      (1 - (Number.isNaN(discount) ? 0 : discount) / 100) *
                      item.quantity *
                      100
                  ) / 100
                : null

            return (
              <Table.Row key={item.id}>
                <Table.Cell>
                  {item.variant?.product?.title ||
                    item.title ||
                    item.variant_id}
                </Table.Cell>
                <Table.Cell>{item.quantity}</Table.Cell>
                <Table.Cell>
                  <Input
                    value={draft?.unit_price ?? ""}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((line) =>
                          line.id === item.id
                            ? { ...line, unit_price: event.target.value }
                            : line
                        )
                      )
                    }
                    placeholder="0.00"
                  />
                </Table.Cell>
                <Table.Cell>
                  <Input
                    value={draft?.discount_percent ?? "0"}
                    onChange={(event) =>
                      setLines((current) =>
                        current.map((line) =>
                          line.id === item.id
                            ? {
                                ...line,
                                discount_percent: event.target.value,
                              }
                            : line
                        )
                      )
                    }
                  />
                </Table.Cell>
                <Table.Cell>
                  {lineTotal != null ? lineTotal.toFixed(2) : "—"}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default QuoteOfferEditor
