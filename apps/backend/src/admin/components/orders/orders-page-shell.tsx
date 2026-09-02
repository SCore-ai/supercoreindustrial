import { Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const OrdersPageShell = ({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-6 p-6">
    <div className="flex items-start justify-between gap-4 border-b border-ui-border-base pb-4">
      <div>
        <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wide">
          Orders
        </Text>
        <h1 className="text-ui-fg-base txt-xlarge-plus mt-1">{title}</h1>
        {subtitle && (
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            {subtitle}
          </Text>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {actions}
        <Link
          to="/orders/abandoned-checkouts"
          className="text-sm text-ui-fg-interactive hover:underline"
        >
          Abandoned checkouts
        </Link>
        <Link
          to="/b2b/order-approvals"
          className="text-sm text-ui-fg-interactive hover:underline"
        >
          B2B approvals
        </Link>
      </div>
    </div>
    {children}
  </div>
)

export default OrdersPageShell
