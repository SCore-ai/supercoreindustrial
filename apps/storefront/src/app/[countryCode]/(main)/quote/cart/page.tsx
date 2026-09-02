import { retrieveQuote } from "@lib/data/quotes"
import QuoteTemplate from "@modules/quote/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quote cart",
  description: "Review quote lines added from the catalog before submitting your RFQ",
}

export default async function QuoteCartPage() {
  const quote = await retrieveQuote().catch(() => null)

  return <QuoteTemplate quote={quote} />
}
