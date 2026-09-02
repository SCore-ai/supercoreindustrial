"use client"

import {
  bulkAddToCart,
  lookupQuickOrderSkus,
  type QuickOrderFailure,
} from "@lib/data/quick-order"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { FormEvent, useCallback, useMemo, useState } from "react"

type GridRow = {
  id: string
  sku: string
  quantity: string
  status: string
  statusType: "idle" | "found" | "error"
}

const EMPTY_ROWS = 10

const createRow = (): GridRow => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sku: "",
  quantity: "1",
  status: "Awaiting input...",
  statusType: "idle",
})

const initialRows = () =>
  Array.from({ length: EMPTY_ROWS }, () => createRow())

const QuickOrderForm = () => {
  const router = useRouter()
  const params = useParams<{ countryCode: string }>()
  const countryCode = params.countryCode
  const [rows, setRows] = useState<GridRow[]>(initialRows)
  const [csvText, setCsvText] = useState("")
  const [mode, setMode] = useState<"grid" | "csv">("grid")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [failures, setFailures] = useState<QuickOrderFailure[]>([])
  const [addedCount, setAddedCount] = useState<number | null>(null)

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

  const resolveRowStatus = useCallback(
    async (id: string, sku: string, quantity: string) => {
      const trimmed = sku.trim()
      if (!trimmed) {
        updateRow(id, {
          status: "Awaiting input...",
          statusType: "idle",
        })
        return
      }

      const lookup = await lookupQuickOrderSkus([
        { sku: trimmed, quantity: Number(quantity || 1) },
      ])

      const match = lookup.items.find(
        (item) => item.sku.toLowerCase() === trimmed.toLowerCase()
      )

      if (match?.title) {
        updateRow(id, {
          status: match.title,
          statusType: "found",
        })
        return
      }

      const failure = lookup.failures.find(
        (entry) => entry.sku?.toLowerCase() === trimmed.toLowerCase()
      )

      updateRow(id, {
        status: failure?.reason ?? "SKU not found",
        statusType: "error",
      })
    },
    []
  )

  const handleGridSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMode("grid")
    setError(null)
    setFailures([])
    setAddedCount(null)
    setIsSubmitting(true)

    try {
      const response = await bulkAddToCart({
        countryCode,
        rows: filledRows,
      })

      setAddedCount(response.added_count)
      setFailures([
        ...response.parse_failures,
        ...response.resolution_failures,
      ])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add items to basket")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCsvSubmit = async () => {
    setMode("csv")
    setError(null)
    setFailures([])
    setAddedCount(null)
    setIsSubmitting(true)

    try {
      const response = await bulkAddToCart({
        countryCode,
        csv: csvText,
      })

      setAddedCount(response.added_count)
      setFailures([
        ...response.parse_failures,
        ...response.resolution_failures,
      ])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import BOM to basket")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8" data-testid="quick-order-form">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
        <section className="sc-b2b-card">
          <div className="sc-b2b-card-header">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[var(--sc-accent)]" aria-hidden>
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Manual Row Entry
          </div>
          <div className="sc-b2b-card-body">
            <form onSubmit={handleGridSubmit}>
              <table className="sc-b2b-table">
                <thead>
                  <tr>
                    <th>SC Stock No. / MPN</th>
                    <th className="w-24">Qty</th>
                    <th>Product Details &amp; Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          value={row.sku}
                          onChange={(event) =>
                            updateRow(row.id, { sku: event.target.value })
                          }
                          onBlur={() =>
                            resolveRowStatus(row.id, row.sku, row.quantity)
                          }
                          placeholder="e.g. 182-2098"
                          className="sc-b2b-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(event) =>
                            updateRow(row.id, { quantity: event.target.value })
                          }
                          className="sc-b2b-input"
                        />
                      </td>
                      <td>
                        <span
                          className={`sc-b2b-status ${
                            row.statusType === "found"
                              ? "is-found"
                              : row.statusType === "error"
                                ? "is-error"
                                : ""
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  className="sc-b2b-btn-secondary"
                  onClick={() => setRows((current) => [...current, createRow()])}
                >
                  + Add Row
                </button>
                <button
                  type="submit"
                  className="sc-b2b-btn-primary"
                  disabled={isSubmitting || !filledRows.length}
                  data-testid="quick-order-grid-submit"
                >
                  {isSubmitting && mode === "grid"
                    ? "Adding..."
                    : "Add Grid to Basket"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="sc-b2b-card h-fit">
          <div className="sc-b2b-card-header">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[var(--sc-accent)]" aria-hidden>
              <path d="M8 4h8l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.6" />
              <path d="M16 4v4h4M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Bulk Copy-Paste BOM
          </div>
          <div className="sc-b2b-card-body">
            <p className="text-sm text-slate-600 leading-relaxed">
              Paste CSV or tab-separated lines containing{" "}
              <strong>[Stock No], [Quantity]</strong>.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Formatting Example:
            </p>
            <div className="sc-b2b-example">182-2098, 5{"\n"}769-2345, 12{"\n"}180-5934, 1</div>
            <textarea
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              placeholder="Paste your CSV code lines here..."
              className="sc-b2b-textarea min-h-[180px] font-mono text-sm"
            />
            <button
              type="button"
              className="sc-b2b-btn-dark mt-4"
              onClick={handleCsvSubmit}
              disabled={isSubmitting || !csvText.trim()}
              data-testid="quick-order-csv-submit"
            >
              {isSubmitting && mode === "csv"
                ? "Importing..."
                : "Import & Add list to Cart"}
            </button>
          </div>
        </section>
      </div>

      <ErrorMessage error={error} />

      {addedCount !== null && (
        <div className="sc-b2b-card">
          <div className="sc-b2b-card-body">
            <p className="font-semibold text-[var(--sc-body)]">
              {addedCount
                ? `Added ${addedCount} line${addedCount === 1 ? "" : "s"} to your basket`
                : "No lines were added"}
            </p>
            {failures.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
                {failures.map((failure, index) => (
                  <li key={`${failure.reason}-${index}`}>
                    {failure.sku ? `${failure.sku}: ${failure.reason}` : failure.reason}
                  </li>
                ))}
              </ul>
            )}
            {addedCount > 0 && (
              <LocalizedClientLink
                href="/cart"
                className="inline-block mt-4 text-sm font-semibold text-[var(--sc-body)] hover:text-[var(--sc-accent-dark)]"
              >
                View basket
              </LocalizedClientLink>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickOrderForm
