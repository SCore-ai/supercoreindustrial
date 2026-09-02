"use client"

import { useState } from "react"

const DownloadOfferPdf = ({ quoteId }: { quoteId: string }) => {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onDownload = async () => {
    setError(null)
    setBusy(true)

    try {
      const response = await fetch(`/api/b2b/quotes/${quoteId}/pdf`, {
        credentials: "include",
      })

      if (!response.ok) {
        const body = await response.text()
        let message = body || `Could not download offer PDF (${response.status})`
        try {
          const parsed = JSON.parse(body) as { message?: string }
          if (parsed?.message) {
            message = parsed.message
          }
        } catch {
          // keep raw body
        }
        throw new Error(message)
      }

      const blob = await response.blob()
      const disposition = response.headers.get("content-disposition")
      const match = disposition?.match(/filename="([^"]+)"/)
      const filename = match?.[1] ?? `Supercore_Quote_${quoteId.slice(-8).toUpperCase()}.pdf`
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not download offer PDF"
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="inline-flex rounded-md bg-[var(--sc-cta)] px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--sc-ink)] hover:bg-[var(--sc-cta-hover)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Preparing PDF..." : "Download offer PDF"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default DownloadOfferPdf
