import { quoteStatusLabel } from "@lib/b2b/account-labels"
import type { StoreB2bQuoteDetail } from "@lib/data/b2b-account"
import { convertToLocale } from "@lib/util/money"
import DownloadOfferPdf from "./download-offer-pdf"

const QuoteDetail = ({ quote }: { quote: StoreB2bQuoteDetail }) => {
  const priced = quote.offer_total != null && Boolean(quote.currency_code)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-[var(--sc-line)]">
        <div className="bg-[var(--sc-ink)] px-6 py-5 text-white">
          <p className="font-display text-[11px] uppercase tracking-[0.18em] text-[var(--sc-cta)]">
            Commercial offer
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight">
                {quote.company || quote.project || "Quote request"}
              </h2>
              {quote.project && quote.company && (
                <p className="mt-1 text-sm text-white/70">{quote.project}</p>
              )}
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
              {quoteStatusLabel(quote.admin_status)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-ui-fg-subtle">Submitted</dt>
              <dd>
                {quote.created_at
                  ? new Date(quote.created_at).toLocaleString("en-GB")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ui-fg-subtle">Valid until</dt>
              <dd>
                {quote.valid_until
                  ? new Date(quote.valid_until).toLocaleDateString("en-GB")
                  : "—"}
              </dd>
            </div>
            {priced && (
              <div>
                <dt className="text-ui-fg-subtle">Offer total</dt>
                <dd className="font-display text-xl text-[var(--sc-ink)]">
                  {convertToLocale({
                    amount: quote.offer_total!,
                    currency_code: quote.currency_code!,
                  })}
                </dd>
              </div>
            )}
            {quote.order_id && (
              <div>
                <dt className="text-ui-fg-subtle">Linked order</dt>
                <dd className="font-mono text-xs">{quote.order_id}</dd>
              </div>
            )}
          </dl>

          {priced && <DownloadOfferPdf quoteId={quote.id} />}

          {quote.notes && (
            <div className="mt-5 rounded-lg bg-[var(--sc-paper)] p-4 text-sm">
              <p className="mb-1 font-medium">Your notes</p>
              <p className="whitespace-pre-wrap text-ui-fg-subtle">
                {quote.notes}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--sc-line)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--sc-paper)] text-ui-fg-subtle">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit price</th>
              <th className="px-4 py-3 font-medium">Line total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-t border-[var(--sc-line)]">
                <td className="px-4 py-3">{item.title || item.variant_id}</td>
                <td className="px-4 py-3 text-ui-fg-subtle">
                  {item.sku || "—"}
                </td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">
                  {item.unit_price != null && quote.currency_code
                    ? convertToLocale({
                        amount: item.unit_price,
                        currency_code: quote.currency_code,
                      })
                    : "Pending"}
                </td>
                <td className="px-4 py-3">
                  {item.line_total != null && quote.currency_code
                    ? convertToLocale({
                        amount: item.line_total,
                        currency_code: quote.currency_code,
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default QuoteDetail
