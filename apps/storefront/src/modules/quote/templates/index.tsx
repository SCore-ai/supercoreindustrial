import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { isBulkOrderEnabled } from "@lib/b2b/nav-links"
import { StoreQuote } from "@lib/data/quotes"
import { Table, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuoteItem from "@modules/quote/components/quote-item"
import SubmitQuoteForm from "@modules/quote/components/submit-quote-form"

const QuoteTemplate = async ({ quote }: { quote: StoreQuote | null }) => {
  const settings = await fetchStoreB2bSettings()
  const quickOrderEnabled = isBulkOrderEnabled(settings)
  const items = quote?.items ?? []
  const isSubmitted = quote?.status === "submitted"

  return (
    <div className="py-12">
      <div className="content-container" data-testid="quote-container">
        <div className="mb-8">
          <Text className="txt-xlarge text-ui-fg-base">Quote cart</Text>
          <Text className="text-ui-fg-subtle text-small-regular mt-1">
            Lines added from the catalog or RFQ. Submit when ready, or open the
            full RFQ form for volume pricing.
          </Text>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <LocalizedClientLink
              href="/quote"
              className="text-ui-fg-interactive hover:underline"
            >
              Request for Quote (RFQ)
            </LocalizedClientLink>
            {quickOrderEnabled && (
              <LocalizedClientLink
                href="/quick-order"
                className="text-ui-fg-interactive hover:underline"
              >
                Quick Order Terminal
              </LocalizedClientLink>
            )}
          </div>
        </div>

        {items.length ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-12 gap-y-8">
            <div className="bg-white py-6">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Product</Table.HeaderCell>
                    <Table.HeaderCell>Quantity</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {items.map((item) => (
                    <QuoteItem key={item.id} item={item} />
                  ))}
                </Table.Body>
              </Table>
            </div>

            <div className="sticky top-12">
              {isSubmitted ? (
                <div className="bg-white p-6 border border-ui-border-base rounded-lg">
                  <Text className="txt-medium-plus">Quote submitted</Text>
                  <Text className="text-ui-fg-subtle text-small-regular mt-2">
                    Reference saved. Our team will follow up shortly.
                  </Text>
                </div>
              ) : (
                <SubmitQuoteForm />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 border border-ui-border-base rounded-lg text-center">
            <Text className="txt-medium text-ui-fg-base">
              Your quote cart is empty
            </Text>
            <Text className="text-ui-fg-subtle text-small-regular mt-2">
              Use Add to quote on catalog products, submit an RFQ with BOM data,
              or use Quick Order for purchasable SKUs.
            </Text>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <LocalizedClientLink
                href="/quote"
                className="text-ui-fg-interactive hover:underline"
              >
                Request for Quote (RFQ)
              </LocalizedClientLink>
              {quickOrderEnabled && (
                <LocalizedClientLink
                  href="/quick-order"
                  className="text-ui-fg-interactive hover:underline"
                >
                  Quick Order Terminal
                </LocalizedClientLink>
              )}
              <LocalizedClientLink
                href="/store"
                className="text-ui-fg-interactive hover:underline"
              >
                Browse products
              </LocalizedClientLink>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteTemplate
