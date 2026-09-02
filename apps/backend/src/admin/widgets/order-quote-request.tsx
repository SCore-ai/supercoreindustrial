import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import QuoteStatusBadge from "../components/b2b/quote-status-badge"
import { b2bClient } from "../lib/client"

const OrderQuoteRequestWidget = () => {
  const { id: orderId } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-b2b-quote-by-order", orderId],
    queryFn: () => b2bClient.getQuoteByOrderId(orderId!),
    enabled: Boolean(orderId),
    retry: false,
  })

  if (isLoading || !data?.quote) {
    return null
  }

  const quote = data.quote

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h2">Linked quote request</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              B2B quote cart that converted to this order
            </Text>
          </div>
          <QuoteStatusBadge
            status={quote.status}
            adminStatus={quote.b2b?.admin_status}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <Text size="small">
            <span className="text-ui-fg-subtle">Company:</span>{" "}
            {quote.company || "—"}
          </Text>
          <Text size="small">
            <span className="text-ui-fg-subtle">Email:</span>{" "}
            {quote.email || "—"}
          </Text>
          <Text size="small">
            <span className="text-ui-fg-subtle">Items:</span>{" "}
            {quote.items.length}
          </Text>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Link
            to={`/b2b/offers/${quote.id}`}
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Open quote request
          </Link>
          {quote.b2b?.erp?.sync_status && (
            <Badge size="2xsmall" color="grey">
              ERP: {quote.b2b.erp.sync_status}
            </Badge>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderQuoteRequestWidget
