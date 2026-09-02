import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import OrderMoreActions from "../../../../components/orders/order-more-actions"
import OrderStatusBadge from "../../../../components/orders/order-status-badge"
import {
  OrderConversionPanel,
  OrderCustomerPanel,
  OrderNotesPanel,
  OrderRiskPanel,
  OrderTagsPanel,
} from "../../../../components/orders/order-sidebar-panels"
import { ordersClient } from "../../../../lib/orders-client"
import type { OrderActionType } from "../../../../lib/orders-types"
import {
  formatOrderDateLong,
  formatOrderMoney,
  fulfillmentStatusLabel,
  paymentStatusLabel,
} from "../../../../lib/orders-utils"

const FulfillmentBadge = ({ status }: { status?: string | null }) => {
  const normalized = (status ?? "not_fulfilled").toLowerCase()
  const fulfilled = ["fulfilled", "shipped", "delivered"].includes(normalized)

  return (
    <Badge color={fulfilled ? "green" : "orange"} size="2xsmall">
      {fulfillmentStatusLabel(status)}
    </Badge>
  )
}

const PaymentBadge = ({ status }: { status?: string | null }) => {
  const normalized = (status ?? "pending").toLowerCase()
  const paid = ["captured", "paid", "partially_refunded"].includes(normalized)

  return (
    <Badge color={paid ? "green" : "grey"} size="2xsmall">
      {paymentStatusLabel(status)}
    </Badge>
  )
}

const OrderManagementDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-order-detail", id],
    queryFn: () => ordersClient.get(id!),
    enabled: Boolean(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-order-detail", id] })
    queryClient.invalidateQueries({ queryKey: ["admin-orders-management"] })
  }

  const updateMutation = useMutation({
    mutationFn: (body: Parameters<typeof ordersClient.update>[1]) =>
      ordersClient.update(id!, body),
    onSuccess: () => {
      invalidate()
      toast.success("Order updated")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const actionMutation = useMutation({
    mutationFn: (action: OrderActionType) => ordersClient.runAction(id!, action),
    onSuccess: (response, action) => {
      invalidate()
      if (action === "duplicate") {
        toast.success(`Duplicated as order #${response.order.display_id}`)
        navigate(`/orders/management/${response.order.id}`)
        return
      }
      toast.success(`Order ${action.replace("_", " ")} completed`)
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const removeMutation = useMutation({
    mutationFn: () => ordersClient.removeOrder(id!),
    onSuccess: () => {
      toast.success("Order removed")
      navigate("/orders/management")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading order...</Text>
      </Container>
    )
  }

  if (error || !data?.order) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">
          {(error as Error)?.message ?? "Order not found"}
        </Text>
      </Container>
    )
  }

  const order = data.order
  const actionLoading = actionMutation.isPending || updateMutation.isPending

  const runAction = (action: string) => {
    if (action === "cancel" && !window.confirm("Cancel this order?")) {
      return
    }

    if (action === "archive" && !window.confirm("Archive this order?")) {
      return
    }

    actionMutation.mutate(action as OrderActionType)
  }

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-ui-fg-base txt-xlarge-plus">
                #{order.display_id}
              </h1>
              <PaymentBadge status={order.payment_status} />
              <FulfillmentBadge status={order.fulfillment_status} />
              <OrderStatusBadge status={order.status} />
              {order.is_test_draft && (
                <Badge color="purple" size="2xsmall">
                  Draft test
                </Badge>
              )}
              {order.is_archived && (
                <Badge color="grey" size="2xsmall">
                  Archived
                </Badge>
              )}
            </div>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              {order.created_at_label ??
                `${formatOrderDateLong(order.created_at)} from ${order.source ?? "Online Store"}`}
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/orders/management"
              className="text-sm text-ui-fg-interactive hover:underline"
            >
              Back to management
            </Link>
            <Button
              size="small"
              variant="secondary"
              onClick={() => window.open(`/orders/${order.id}`, "_blank")}
            >
              Refund / Edit (core)
            </Button>
            <OrderMoreActions
              order={order}
              onAction={runAction}
              isLoading={actionLoading}
            />
            <Button
              size="small"
              variant="danger"
              isLoading={removeMutation.isPending}
              onClick={() => {
                if (window.confirm(`Remove order #${order.display_id}?`)) {
                  removeMutation.mutate()
                }
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base">
            <div className="flex items-center justify-between border-b border-ui-border-base bg-orange-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <FulfillmentBadge status={order.fulfillment_status} />
                <Text size="small" weight="plus">
                  {order.item_count} item{order.item_count === 1 ? "" : "s"}
                </Text>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Fulfillment
              </Text>
            </div>

            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 px-4 py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-ui-bg-subtle text-xs text-ui-fg-subtle">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      "SKU"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Text size="small" weight="plus">
                      {item.title}
                    </Text>
                    {item.subtitle && (
                      <Text size="xsmall" className="text-ui-fg-subtle">
                        {item.subtitle}
                      </Text>
                    )}
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {formatOrderMoney(item.unit_price, order.currency_code)} ×{" "}
                      {item.quantity}
                    </Text>
                  </div>
                  <Text size="small" weight="plus">
                    {formatOrderMoney(item.total, order.currency_code)}
                  </Text>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-ui-border-base px-4 py-3">
              <Button size="small" variant="secondary" disabled>
                Mark as fulfilled
              </Button>
              <Button size="small" variant="secondary" disabled>
                Create shipping label
              </Button>
              <Text size="xsmall" className="self-center text-ui-fg-subtle">
                Use Medusa core order for fulfillment workflows
              </Text>
            </div>
          </div>

          <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
            <div className="mb-4 flex items-center gap-2">
              <PaymentBadge status={order.payment_status} />
              <Text size="small" weight="plus">
                Payment summary
              </Text>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ui-fg-subtle">Subtotal</span>
                <span>{formatOrderMoney(order.subtotal, order.currency_code)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ui-fg-subtle">Shipping</span>
                <span>
                  {formatOrderMoney(order.shipping_total, order.currency_code)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ui-fg-subtle">Taxes</span>
                <span>{formatOrderMoney(order.tax_total, order.currency_code)}</span>
              </div>
              {!!order.discount_total && (
                <div className="flex justify-between text-sm">
                  <span className="text-ui-fg-subtle">Discount</span>
                  <span>
                    -{formatOrderMoney(order.discount_total, order.currency_code)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-ui-border-base pt-2 text-sm font-semibold">
                <span>Total</span>
                <span>{formatOrderMoney(order.total, order.currency_code)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ui-fg-subtle">Paid</span>
                <span>{formatOrderMoney(order.total, order.currency_code)}</span>
              </div>
            </div>
          </div>

          {order.b2b_quote_id && (
            <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
              <Text size="small" weight="plus">
                Linked B2B quote
              </Text>
              <Link
                to={`/b2b/offers/${order.b2b_quote_id}`}
                className="mt-2 inline-block text-sm text-ui-fg-interactive hover:underline"
              >
                Open quote request
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <OrderNotesPanel
            order={order}
            saving={updateMutation.isPending}
            onSaveNotes={(customer_notes) =>
              updateMutation.mutate({ customer_notes })
            }
          />
          <OrderCustomerPanel
            order={order}
            saving={updateMutation.isPending}
            onSaveEmail={(email) => updateMutation.mutate({ email })}
            onSaveShipping={(shipping_address) =>
              updateMutation.mutate({ shipping_address })
            }
            onRemoveCustomer={() => actionMutation.mutate("remove_customer")}
          />
          <OrderConversionPanel order={order} />
          <OrderRiskPanel order={order} />
          <OrderTagsPanel
            order={order}
            saving={updateMutation.isPending}
            onSaveTags={(tags) => updateMutation.mutate({ tags })}
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Order detail",
  link: false,
})

export default OrderManagementDetailPage
