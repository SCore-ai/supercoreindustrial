import { fetchStoreB2bSettings } from "@lib/data/b2b"
import RfqForm from "@modules/quote/components/rfq-form"
import { Metadata } from "next"
import "styles/b2b-terminal.css"

export const metadata: Metadata = {
  title: "Request for Quote (RFQ)",
  description:
    "Get volume-based discounts and dedicated pricing terms for scheduled components and major hardware build projects",
}

export default async function QuoteRfqPage() {
  const settings = await fetchStoreB2bSettings()
  const quotesEnabled = settings?.features.quotes !== false

  return (
    <div className="sc-b2b-page py-12">
      <div className="content-container" data-testid="quote-rfq-page">
        <div className="sc-b2b-hero">
          <h1>Request for Quote (RFQ)</h1>
          <p>
            Get volume-based discounts and dedicated pricing terms for scheduled
            components, major hardware build projects, and custom procurement
            requirements.
          </p>
        </div>

        {quotesEnabled ? (
          <RfqForm />
        ) : (
          <div className="sc-b2b-card">
            <div className="sc-b2b-card-body">
              <p>Quote requests are not available right now.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
