"use client"

import {
  addToQuote,
  bulkAddToQuote,
  submitQuote,
} from "@lib/data/quotes"
import { lookupQuickOrderSkus } from "@lib/data/quick-order"
import ErrorMessage from "@modules/checkout/components/error-message"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { ChangeEvent, FormEvent, useState } from "react"

const RfqForm = () => {
  const router = useRouter()
  const params = useParams<{ countryCode: string }>()
  const countryCode = params.countryCode
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [bomFileName, setBomFileName] = useState<string | null>(null)
  const [bomCsv, setBomCsv] = useState("")

  const handleBomFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const text = await file.text()
    setBomCsv(text)
    setBomFileName(file.name)
    event.target.value = ""
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    const sku = String(formData.get("sku") || "").trim()
    const quantity = Number(formData.get("quantity") || 0)
    const targetPrice = String(formData.get("target_price") || "").trim()
    const project = String(formData.get("project") || "").trim()
    const company = String(formData.get("company") || "").trim()
    const contactName = String(formData.get("contact_name") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const phone = String(formData.get("phone") || "").trim()
    const notes = String(formData.get("notes") || "").trim()

    const noteParts = [
      sku ? `Part / SKU: ${sku}${quantity > 0 ? ` x ${quantity}` : ""}` : null,
      contactName ? `Contact: ${contactName}` : null,
      phone ? `Phone: ${phone}` : null,
      targetPrice ? `Target unit price: £${targetPrice}` : null,
      notes || null,
    ].filter(Boolean)

    try {
      if (bomCsv.trim()) {
        await bulkAddToQuote({
          countryCode,
          csv: bomCsv,
        })
      }

      if (sku && quantity > 0) {
        const lookup = await lookupQuickOrderSkus([{ sku, quantity }])
        const match = lookup.items[0]

        if (match?.variant_id) {
          await addToQuote({
            variantId: match.variant_id,
            quantity,
            countryCode,
          })
        }
      }

      await submitQuote({
        email,
        company: company || undefined,
        project: project || undefined,
        notes: noteParts.join("\n") || undefined,
      })

      setSubmitted(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit RFQ")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="sc-b2b-card">
        <div className="sc-b2b-card-body">
          <h2 className="text-xl font-semibold text-[var(--sc-body)]">
            RFQ submitted
          </h2>
          <p className="mt-2 text-slate-600">
            Our sourcing team will review your request and respond with a custom
            pricing matrix.
          </p>
          <LocalizedClientLink
            href="/account/trade/quotes"
            className="inline-block mt-4 text-sm font-semibold hover:text-[var(--sc-accent-dark)]"
          >
            View my quotes
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-testid="rfq-form">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_340px]">
        <section className="sc-b2b-card">
          <div className="sc-b2b-card-header">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[var(--sc-accent)]" aria-hidden>
              <path d="M3 11l18-7-7 18-2-8-9-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            RFQ Sourcing Form
          </div>
          <div className="sc-b2b-card-body space-y-8">
            <div>
              <h3 className="sc-b2b-section-title">1. Component Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label>
                  <span className="sc-b2b-label">Part Number / SC Stock No. / MPN</span>
                  <input name="sku" placeholder="e.g. 182-2098" className="sc-b2b-input" />
                </label>
                <label>
                  <span className="sc-b2b-label">Quantity Needed</span>
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    placeholder="e.g. 250"
                    className="sc-b2b-input"
                  />
                </label>
                <label>
                  <span className="sc-b2b-label">Target Unit Price (£ - Optional)</span>
                  <input
                    name="target_price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 62.50"
                    className="sc-b2b-input"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="sc-b2b-label">Project Name / End Application</span>
                  <input
                    name="project"
                    placeholder="e.g. EV Charger Assembly Run"
                    className="sc-b2b-input"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="sc-b2b-section-title">2. Business &amp; Sourcing Contact</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label>
                  <span className="sc-b2b-label">Company Name</span>
                  <input
                    name="company"
                    required
                    placeholder="e.g. TechCorp Solutions Ltd"
                    className="sc-b2b-input"
                  />
                </label>
                <label>
                  <span className="sc-b2b-label">Contact Person Name</span>
                  <input
                    name="contact_name"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    className="sc-b2b-input"
                  />
                </label>
                <label>
                  <span className="sc-b2b-label">Work Email Address</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="s.jenkins@techcorp.com"
                    className="sc-b2b-input"
                  />
                </label>
                <label>
                  <span className="sc-b2b-label">Contact Phone Number</span>
                  <input
                    name="phone"
                    required
                    placeholder="e.g. +44 20 7946 0958"
                    className="sc-b2b-input"
                  />
                </label>
                <label className="md:col-span-2">
                  <span className="sc-b2b-label">
                    Additional Requirements / Custom Sourcing Notes
                  </span>
                  <textarea
                    name="notes"
                    rows={5}
                    placeholder="Specify split shipment dates, packaging needs (reel vs tube), buffer stock arrangements, or test certificate requests..."
                    className="sc-b2b-textarea"
                  />
                </label>
              </div>
            </div>

            <ErrorMessage error={error} />

            <button
              type="submit"
              className="sc-b2b-btn-primary w-full"
              disabled={isSubmitting}
              data-testid="rfq-submit"
            >
              {isSubmitting ? "Submitting..." : "Request Custom Pricing Matrix"}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="sc-b2b-upload-zone">
            <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-10 w-10 text-[var(--sc-accent)]" aria-hidden>
              <path d="M12 16V8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-[var(--sc-body)]">
              Upload Bill of Materials (BOM)
            </h3>
            <p>
              Drag &amp; drop your Excel/CSV parts list here, or click to upload
              your procurement file.
            </p>
            <label className="mt-4 inline-block cursor-pointer sc-b2b-btn-secondary">
              Choose file
              <input
                type="file"
                accept=".csv,.txt,text/csv"
                className="hidden"
                onChange={handleBomFile}
              />
            </label>
            {bomFileName && (
              <p className="mt-3 text-sm font-medium text-[var(--sc-body)]">
                {bomFileName}
              </p>
            )}
          </div>

          <div className="sc-b2b-policies">
            <h4>Supercore AI RFQ Policies</h4>
            <ul className="list-none p-0 m-0">
              <li>
                <div>
                  <strong>Sourcing &amp; Equivalents</strong>
                  <p className="mt-1">
                    Our engineers may suggest direct equivalents or upgraded
                    alternatives to improve lead time or lifecycle.
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Direct Account Managers</strong>
                  <p className="mt-1">
                    RFQ requests exceeding £5,000 are assigned a dedicated
                    account manager within one business day.
                  </p>
                </div>
              </li>
              <li>
                <div>
                  <strong>Split Delivery Schedules</strong>
                  <p className="mt-1">
                    We support call-off schedules up to 12 months for approved
                    trade accounts.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </form>
  )
}

export default RfqForm
