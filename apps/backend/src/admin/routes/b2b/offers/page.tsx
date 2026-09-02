import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Container,
  Select,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import B2bPageShell from "../../../components/b2b/b2b-page-shell"
import B2bRecordActions from "../../../components/b2b/b2b-record-actions"
import QuoteStatusBadge from "../../../components/b2b/quote-status-badge"
import { useOfferRecordActions } from "../../../hooks/use-b2b-record-actions"
import { b2bClient } from "../../../lib/client"

const PAGE_SIZE = 20

function isArchivedOffer(quote: { b2b?: { admin_status?: string } | null }) {
  return quote.b2b?.admin_status === "cancelled"
}

const B2bOffersPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [offset, setOffset] = useState(0)

  const queryParams = useMemo(() => {
    return {
      limit: PAGE_SIZE,
      offset,
      ...(statusFilter === "draft" || statusFilter === "submitted"
        ? { status: statusFilter }
        : {}),
      ...(statusFilter === "archived" ? { archived_only: true } : {}),
    }
  }, [offset, statusFilter])

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-b2b-quotes", queryParams],
    queryFn: () => b2bClient.listQuotes(queryParams),
  })

  const { archive, restore, remove } = useOfferRecordActions()

  const quotes = data?.quotes ?? []
  const count = data?.count ?? 0
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <Container className="p-0">
      <B2bPageShell
        title="Offers"
        subtitle="Quote requests and priced offers (B2B Module offers & quotes)"
        actions={
          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setOffset(0)
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="Filter status" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All statuses</Select.Item>
                <Select.Item value="draft">Draft</Select.Item>
                <Select.Item value="submitted">Submitted</Select.Item>
                <Select.Item value="archived">Archived</Select.Item>
              </Select.Content>
            </Select>
          </div>
        }
      >
        {isLoading && <Text>Loading offers...</Text>}
        {error && (
          <Text className="text-ui-fg-error">
            Failed to load offers: {(error as Error).message}
          </Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Offer / quote</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Workflow</Table.HeaderCell>
                <Table.HeaderCell>Items</Table.HeaderCell>
                <Table.HeaderCell>ERP sync</Table.HeaderCell>
                <Table.HeaderCell>Created</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {quotes.map((quote) => (
                <Table.Row key={quote.id}>
                  <Table.Cell>
                    <Link
                      to={`/b2b/offers/${quote.id}`}
                      className="text-ui-fg-interactive hover:underline"
                    >
                      {quote.id.slice(-8).toUpperCase()}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Text size="small" weight="plus">
                        {quote.company || "—"}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {quote.email || "No email"}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <QuoteStatusBadge
                      status={quote.status}
                      adminStatus={quote.b2b?.admin_status}
                    />
                  </Table.Cell>
                  <Table.Cell>{quote.item_count}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        quote.b2b?.erp?.sync_status === "synced"
                          ? "green"
                          : "grey"
                      }
                      size="2xsmall"
                    >
                      {quote.b2b?.erp?.sync_status ?? "not_configured"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {quote.created_at
                      ? new Date(quote.created_at).toLocaleString()
                      : "—"}
                  </Table.Cell>
                  <Table.Cell>
                    <B2bRecordActions
                      recordId={quote.id}
                      recordLabel={`offer ${quote.id.slice(-8).toUpperCase()}`}
                      isArchived={isArchivedOffer(quote)}
                      archive={archive}
                      restore={restore}
                      remove={remove}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}

              {!quotes.length && (
                <Table.Row>
                  <Table.Cell colSpan={7}>
                    <Text className="text-ui-fg-subtle">
                      {statusFilter === "archived"
                        ? "No archived offers."
                        : "No offers or quote requests yet."}
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Text size="small" className="text-ui-fg-subtle">
            {count} total
          </Text>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-ui-fg-interactive disabled:text-ui-fg-disabled"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </button>
            <Text size="small">
              Page {page} of {pageCount}
            </Text>
            <button
              type="button"
              className="text-ui-fg-interactive disabled:text-ui-fg-disabled"
              disabled={offset + PAGE_SIZE >= count}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        </div>
      </B2bPageShell>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Offers",
  rank: 8,
})

export default B2bOffersPage
