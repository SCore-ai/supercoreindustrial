import { Button, Input, Text, toast } from "@medusajs/ui"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import type { AdminOrderDetail } from "../../lib/orders-types"
import {
  buildOrderStatusPageUrl,
  formatOrderMoney,
  printOrderDocument,
} from "../../lib/orders-utils"

type ActionItem = {
  id: string
  label: string
  section?: string
  onSelect: () => void
}

const OrderMoreActions = ({
  order,
  onAction,
  isLoading,
}: {
  order: AdminOrderDetail
  onAction: (action: string) => void
  isLoading?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const printOrderPage = () => {
    const rows = order.items
      .map(
        (item) =>
          `<tr><td>${item.title}</td><td>${item.quantity}</td><td>${formatOrderMoney(item.total, order.currency_code)}</td></tr>`
      )
      .join("")

    printOrderDocument(
      `Order #${order.display_id}`,
      `
        <h1>Order #${order.display_id}</h1>
        <p class="muted">${order.created_at_label ?? ""}</p>
        <p><strong>Customer:</strong> ${order.customer_name ?? "Guest"}</p>
        <p><strong>Email:</strong> ${order.email ?? "—"}</p>
        <table>
          <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><strong>Total:</strong> ${formatOrderMoney(order.total, order.currency_code)}</p>
      `
    )
  }

  const printPackingSlips = () => {
    const rows = order.items
      .map(
        (item) =>
          `<tr><td>${item.sku ?? "—"}</td><td>${item.title}</td><td>${item.quantity}</td></tr>`
      )
      .join("")

    printOrderDocument(
      `Packing slip #${order.display_id}`,
      `
        <h1>Packing slip — Order #${order.display_id}</h1>
        <p class="muted">Ship to:</p>
        <p>${(order.shipping_address?.first_name ?? "")} ${(order.shipping_address?.last_name ?? "")}</p>
        <p>${order.shipping_address?.address_1 ?? ""}</p>
        <p>${order.shipping_address?.city ?? ""} ${order.shipping_address?.postal_code ?? ""}</p>
        <table>
          <thead><tr><th>SKU</th><th>Item</th><th>Qty</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `
    )
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const allActions: ActionItem[] = [
      {
        id: "duplicate",
        label: "Duplicate",
        onSelect: () => onAction("duplicate"),
      },
      {
        id: "cancel",
        label: "Cancel order",
        onSelect: () => onAction("cancel"),
      },
      {
        id: "archive",
        label: "Archive",
        onSelect: () => onAction("archive"),
      },
      {
        id: "status-page",
        label: "View order status page",
        onSelect: () => {
          window.open(buildOrderStatusPageUrl(order.id), "_blank", "noopener,noreferrer")
        },
      },
      {
        id: "print-order",
        label: "Print order page",
        section: "Print",
        onSelect: printOrderPage,
      },
      {
        id: "print-packing",
        label: "Print packing slips",
        section: "Print",
        onSelect: printPackingSlips,
      },
    ]

    if (!needle) {
      return allActions
    }

    return allActions.filter((action) =>
      action.label.toLowerCase().includes(needle)
    )
  }, [onAction, order, query])

  const grouped = filtered.reduce<Record<string, ActionItem[]>>((acc, action) => {
    const key = action.section ?? "Actions"
    acc[key] = acc[key] ?? []
    acc[key].push(action)
    return acc
  }, {})

  return (
    <div className="relative">
      <Button
        size="small"
        variant="secondary"
        isLoading={isLoading}
        onClick={() => setOpen((current) => !current)}
      >
        More actions
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-ui-border-base bg-ui-bg-base p-2 shadow-lg">
            <Input
              placeholder="Search actions"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-2 max-h-80 overflow-y-auto">
              {Object.entries(grouped).map(([section, items]) => (
                <div key={section} className="py-1">
                  <Text size="xsmall" className="px-2 py-1 text-ui-fg-subtle uppercase">
                    {section}
                  </Text>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-ui-bg-subtle"
                      onClick={() => {
                        setOpen(false)
                        try {
                          item.onSelect()
                        } catch (error) {
                          toast.error((error as Error).message)
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
              {!filtered.length && (
                <Text size="small" className="px-2 py-3 text-ui-fg-subtle">
                  No actions match your search.
                </Text>
              )}
            </div>
            <div className="mt-2 border-t border-ui-border-base pt-2">
              <Link
                to={`/orders/${order.id}`}
                className="block rounded-md px-2 py-2 text-sm text-ui-fg-interactive hover:bg-ui-bg-subtle"
                onClick={() => setOpen(false)}
              >
                Open Medusa core order
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderMoreActions
