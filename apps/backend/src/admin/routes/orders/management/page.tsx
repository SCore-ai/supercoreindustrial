import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
import { Badge, Button, Container, Input, Select, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import OrdersMetricGrid from "../../../components/orders/orders-metric-grid"
import OrdersPageShell from "../../../components/orders/orders-page-shell"
import { ordersClient } from "../../../lib/orders-client"
import {
  formatOrderDate,
  formatOrderMoney,
  fulfillmentStatusLabel,
  paymentStatusLabel,
} from "../../../lib/orders-utils"

const PAGE_SIZE = 20

const OrdersManagementPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("all")
  const [draftsOnly, setDraftsOnly] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [offset, setOffset] = useState(0)

  const queryParams = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset,
      status: statusFilter,
      q: debouncedSearch || undefined,
      test_drafts_only: draftsOnly,
    }),
    [debouncedSearch, draftsOnly, offset, statusFilter]
  )

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["admin-orders-management", queryParams],
    queryFn: () => ordersClient.list(queryParams),
  })

  const createDraftMutation = useMutation({
    mutationFn: () => ordersClient.createDraftOrder(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-management"] })
      toast.success(`Draft order #${response.order.display_id} created`)
      navigate(`/orders/management/${response.order.id}`)
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const orders = data?.orders ?? []
  const count = data?.count ?? 0
  const stats = data?.stats
  const page = Math.floor(offset / PAGE_SIZE) + 1
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setOffset(0)
    setDebouncedSearch(search.trim())
  }

  const riskTone = (level?: string) => {
    if (level === "high") return "text-red-500"
    if (level === "medium") return "text-orange-500"
    return "text-emerald-500"
  }

  return (
    <Container className="p-0">
      <OrdersPageShell
        title="Management"
        subtitle="Unified order operations, test drafts, and quick links to fulfillment workflows"
        actions={
          <>
            <Button
              size="small"
              variant="secondary"
              isLoading={isFetching}
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["admin-orders-management"],
                })
              }
            >
              Refresh
            </Button>
            <Button
              size="small"
              isLoading={createDraftMutation.isPending}
              onClick={() => createDraftMutation.mutate()}
            >
              Create draft order
            </Button>
          </>
        }
      >
        {stats && <OrdersMetricGrid stats={stats} />}

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setOffset(0)
              }}
            >
              <Select.Trigger>
                <Select.Value placeholder="All statuses" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All statuses</Select.Item>
                <Select.Item value="pending">Pending</Select.Item>
                <Select.Item value="completed">Completed</Select.Item>
                <Select.Item value="canceled">Canceled</Select.Item>
                <Select.Item value="requires_action">Requires action</Select.Item>
                <Select.Item value="archived">Archived</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <Button
            size="small"
            variant={draftsOnly ? "primary" : "secondary"}
            onClick={() => {
              setDraftsOnly((current) => !current)
              setOffset(0)
            }}
          >
            {draftsOnly ? "Showing draft tests" : "Draft tests only"}
          </Button>

          <form className="min-w-[240px] flex-1" onSubmit={handleSearchSubmit}>
            <Input
              placeholder="Search by order #, email, customer, or ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </form>
        </div>

        {isLoading && <Text>Loading orders...</Text>}
        {error && (
          <Text className="text-ui-fg-error">
            Failed to load orders: {(error as Error).message}
          </Text>
        )}

        {!isLoading && !error && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Order</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Payment</Table.HeaderCell>
                <Table.HeaderCell>Fulfillment</Table.HeaderCell>
                <Table.HeaderCell>Items</Table.HeaderCell>
                <Table.HeaderCell>Total</Table.HeaderCell>
                <Table.HeaderCell>Risk</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {orders.map((order) => (
                <Table.Row key={order.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/orders/management/${order.id}`}
                        className="text-ui-fg-interactive hover:underline"
                      >
                        #{order.display_id}
                      </Link>
                      {order.has_customer_notes && (
                        <Badge color="grey" size="2xsmall">
                          Note
                        </Badge>
                      )}
                      {order.is_test_draft && (
                        <Badge color="purple" size="2xsmall">
                          Draft
                        </Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{formatOrderDate(order.created_at)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Text size="small" weight="plus">
                        {order.customer_name || "Guest"}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {order.email || "No email"}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="xsmall">
                      {paymentStatusLabel(order.payment_status)}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        ["fulfilled", "shipped", "delivered"].includes(
                          (order.fulfillment_status ?? "").toLowerCase()
                        )
                          ? "green"
                          : "orange"
                      }
                      size="2xsmall"
                    >
                      {fulfillmentStatusLabel(order.fulfillment_status)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{order.item_count ?? 0}</Table.Cell>
                  <Table.Cell>
                    {formatOrderMoney(order.total, order.currency_code)}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`text-xs font-medium uppercase ${riskTone(order.risk_level)}`}
                    >
                      {order.risk_level ?? "low"}
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}

              {!orders.length && (
                <Table.Row>
                  <Table.Cell colSpan={8}>
                    <Text className="text-ui-fg-subtle">
                      No orders match your filters. Create a draft order to start
                      testing fulfillment and admin workflows.
                    </Text>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}

        <div className="flex items-center justify-between">
          <Text size="small" className="text-ui-fg-subtle">
            {count} matching orders · Click a row to open the Shopify-style detail view
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
      </OrdersPageShell>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Management",
  icon: ShoppingBag,
  nested: "/orders",
  rank: 1,
})

export default OrdersManagementPage
