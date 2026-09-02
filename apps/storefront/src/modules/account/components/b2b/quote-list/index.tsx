import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  quoteStatusLabel,
} from "@lib/b2b/account-labels"
import type { StoreB2bQuoteSummary } from "@lib/data/b2b-account"
import { convertToLocale } from "@lib/util/money"

const QuoteList = ({ quotes }: { quotes: StoreB2bQuoteSummary[] }) => {
  if (!quotes.length) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--sc-line)] p-8 text-center text-ui-fg-subtle">
        <p className="text-base-regular">You have no submitted quotes yet.</p>
        <LocalizedClientLink
          href="/quote/cart"
          className="mt-3 inline-block text-[var(--sc-body)] hover:text-[var(--sc-cta)] hover:underline"
        >
          Open quote cart
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--sc-line)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--sc-paper)] text-ui-fg-subtle">
          <tr>
            <th className="px-4 py-3 font-medium">Quote</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Offer</th>
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr key={quote.id} className="border-t border-[var(--sc-line)]">
              <td className="px-4 py-3">
                <LocalizedClientLink
                  href={`/account/trade/quotes/${quote.id}`}
                  className="font-medium text-[var(--sc-body)] hover:text-[var(--sc-cta)] hover:underline"
                >
                  {quote.company || quote.project || quote.id.slice(-8)}
                </LocalizedClientLink>
                {quote.project && (
                  <p className="text-xs text-ui-fg-subtle">{quote.project}</p>
                )}
              </td>
              <td className="px-4 py-3">
                {quoteStatusLabel(quote.admin_status)}
              </td>
              <td className="px-4 py-3">{quote.item_count}</td>
              <td className="px-4 py-3">
                {quote.offer_total != null && quote.currency_code
                  ? convertToLocale({
                      amount: quote.offer_total,
                      currency_code: quote.currency_code,
                    })
                  : "—"}
              </td>
              <td className="px-4 py-3 text-ui-fg-subtle">
                {quote.updated_at
                  ? new Date(quote.updated_at).toLocaleDateString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default QuoteList
