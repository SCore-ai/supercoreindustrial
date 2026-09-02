"use client"

import {
  bulkAddToQuote,
  type BulkAddToQuoteResult,
} from "@lib/data/quotes"
import { Button, Table, Text } from "@modules/common/components/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useMemo, useState } from "react"

type GridRow = {
  id: string
  sku: string
  quantity: string
}

const EMPTY_ROWS = 5

const createRow = (): GridRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sku: "",
  quantity: "1",
})

const initialRows = () => Array.from({ length: EMPTY_ROWS }, () => createRow())

const BulkOrderForm = () => {
  const router = useRouter()
  const params = useParams<{ countryCode: string }>()
  const countryCode = params.countryCode
  const [rows, setRows] = useState<GridRow[]>(initialRows)
  const [csvText, setCsvText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BulkAddToQuoteResult | null>(null)

  const filledRows = useMemo(
    () =>
      rows
        .map((row) => ({
          sku: row.sku.trim(),
          quantity: Number(row.quantity || 1),
        }))
        .filter((row) => row.sku),
    [rows]
  )

  const updateRow = (id: string, patch: Partial<GridRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    )
  }

  const addRow = () => {
    setRows((current) => [...current, createRow()])
  }

  const removeRow = (id: string) => {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.id !== id)
    )
  }

  const handleCsvFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const text = await file.text()
    setCsvText(text)
    event.target.value = ""
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResult(null)
    setIsSubmitting(true)

    try {
      const response = await bulkAddToQuote({
        countryCode,
        rows: filledRows.length ? filledRows : undefined,
        csv: csvText.trim() || undefined,
      })

      setResult(response)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add items to quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addedCount = result?.added_count ?? 0
  const failureCount =
    (result?.parse_failures.length ?? 0) +
    (result?.resolution_failures.length ?? 0)

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-y-8"
      data-testid="bulk-order-form"
    >
      <section className="bg-white border border-ui-border-base rounded-lg p-6 flex flex-col gap-y-4">
        <div>
          <Text className="txt-medium-plus text-ui-fg-base">SKU grid</Text>
          <Text className="text-ui-fg-subtle text-small-regular mt-1">
            Enter part numbers and quantities. Leave blank rows out of the import.
          </Text>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>SKU / part number</Table.HeaderCell>
              <Table.HeaderCell className="w-32">Quantity</Table.HeaderCell>
              <Table.HeaderCell className="w-20" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <Table.Cell>
                  <input
                    value={row.sku}
                    onChange={(event) =>
                      updateRow(row.id, { sku: event.target.value })
                    }
                    placeholder="e.g. 01919-021"
                    className="w-full h-10 px-3 border border-ui-border-base rounded-md"
                  />
                </Table.Cell>
                <Table.Cell>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(event) =>
                      updateRow(row.id, { quantity: event.target.value })
                    }
                    className="w-full h-10 px-3 border border-ui-border-base rounded-md"
                  />
                </Table.Cell>
                <Table.Cell>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-ui-fg-subtle hover:text-ui-fg-base text-sm"
                  >
                    Remove
                  </button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Button type="button" variant="secondary" size="small" onClick={addRow}>
          Add row
        </Button>
      </section>

      <section className="bg-white border border-ui-border-base rounded-lg p-6 flex flex-col gap-y-4">
        <div>
          <Text className="txt-medium-plus text-ui-fg-base">CSV upload</Text>
          <Text className="text-ui-fg-subtle text-small-regular mt-1">
            Upload or paste CSV with SKU and quantity columns. When CSV is provided,
            it takes priority over the grid.
          </Text>
        </div>

        <label className="flex flex-col gap-y-2 text-sm">
          <span>CSV file</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvFile}
            className="text-sm"
          />
        </label>

        <label className="flex flex-col gap-y-2 text-sm">
          <span>Or paste CSV</span>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            rows={6}
            placeholder={"sku,quantity\n01919-021,2\n01932-021,1"}
            className="px-3 py-2 border border-ui-border-base rounded-md font-mono text-sm"
          />
        </label>
      </section>

      <ErrorMessage error={error} />

      {result && (
        <div className="bg-white border border-ui-border-base rounded-lg p-6 flex flex-col gap-y-3">
          <Text className="txt-medium-plus text-ui-fg-base">
            {addedCount
              ? `Added ${addedCount} line${addedCount === 1 ? "" : "s"} to your quote`
              : "No lines were added"}
          </Text>

          {failureCount > 0 && (
            <div className="text-sm text-ui-fg-subtle">
              <p>{failureCount} row(s) could not be imported:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {[...result.parse_failures, ...result.resolution_failures].map(
                  (failure, index) => (
                    <li key={`${failure.reason}-${index}`}>
                      {"sku" in failure && failure.sku
                        ? `${failure.sku}: ${failure.reason}`
                        : failure.reason}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {addedCount > 0 && (
            <LocalizedClientLink
              href="/quote"
              className="text-ui-fg-interactive hover:underline text-sm"
            >
              View quote cart
            </LocalizedClientLink>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          data-testid="bulk-order-submit"
        >
          Add to quote
        </Button>
        <LocalizedClientLink
          href="/quote"
          className="text-ui-fg-interactive hover:underline text-sm"
        >
          Back to quote cart
        </LocalizedClientLink>
      </div>
    </form>
  )
}

export default BulkOrderForm
