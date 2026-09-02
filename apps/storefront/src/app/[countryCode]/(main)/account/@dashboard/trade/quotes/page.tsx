import { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { listB2bQuotes } from "@lib/data/b2b-account"
import { retrieveCustomer } from "@lib/data/customer"
import QuoteList from "@modules/account/components/b2b/quote-list"

export const metadata: Metadata = {
  title: "My quotes",
  description: "Submitted quote requests and offers",
}

export default async function TradeQuotesPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const settings = await fetchStoreB2bSettings()

  if (settings?.features.quotes === false) {
    notFound()
  }

  const quotes = await listB2bQuotes()

  return (
    <div>
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">My quotes</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          Track submitted requests and priced offers from our sales team.
        </p>
      </div>
      <QuoteList quotes={quotes} />
    </div>
  )
}
