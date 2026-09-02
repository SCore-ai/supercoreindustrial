import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { isBulkOrderEnabled } from "@lib/b2b/nav-links"
import QuickOrderForm from "@modules/quick-order/components/quick-order-form"
import { Metadata } from "next"
import "styles/b2b-terminal.css"

export const metadata: Metadata = {
  title: "Quick Order Terminal",
  description:
    "Rapidly build and purchase your parts list by entering stock numbers or importing BOM data",
}

export default async function QuickOrderPage() {
  const settings = await fetchStoreB2bSettings()
  const enabled = isBulkOrderEnabled(settings)

  return (
    <div className="sc-b2b-page py-12">
      <div className="content-container" data-testid="quick-order-page">
        <div className="sc-b2b-hero">
          <h1>Quick Order Terminal</h1>
          <p>
            Skip searching. Rapidly build and purchase your parts list by entering
            stock numbers directly or importing your BOM file data.
          </p>
        </div>

        {enabled ? (
          <QuickOrderForm />
        ) : (
          <div className="sc-b2b-card">
            <div className="sc-b2b-card-body">
              <p>Quick Order is not available right now.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
