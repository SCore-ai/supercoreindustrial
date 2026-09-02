import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { retrieveB2bQuote } from "@lib/data/b2b-account"
import { retrieveCustomer } from "@lib/data/customer"
import QuoteDetail from "@modules/account/components/b2b/quote-detail"

export const metadata: Metadata = {
  title: "Quote detail",
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function TradeQuoteDetailPage({ params }: PageProps) {
  const { id } = await params
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const settings = await fetchStoreB2bSettings()

  if (settings?.features.quotes === false) {
    notFound()
  }

  const quote = await retrieveB2bQuote(id)

  if (!quote) {
    notFound()
  }

  return (
    <div>
      <LocalizedClientLink
        href="/account/trade/quotes"
        className="mb-6 inline-block text-sm text-[var(--sc-accent)] hover:underline"
      >
        Back to quotes
      </LocalizedClientLink>
      <QuoteDetail quote={quote} />
    </div>
  )
}
