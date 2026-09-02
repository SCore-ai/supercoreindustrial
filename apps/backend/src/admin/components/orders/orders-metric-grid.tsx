import { Text } from "@medusajs/ui"
import type { AdminOrderStats } from "../../lib/orders-types"

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "blue" | "orange" | "green" | "red" | "violet" | "grey"
}) => {
  const toneClass =
    tone === "orange"
      ? "border-orange-200 bg-orange-50"
      : tone === "green"
        ? "border-emerald-200 bg-emerald-50"
        : tone === "red"
          ? "border-red-200 bg-red-50"
          : tone === "violet"
            ? "border-violet-200 bg-violet-50"
            : tone === "grey"
              ? "border-ui-border-base bg-ui-bg-subtle"
              : "border-blue-200 bg-blue-50"

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <Text size="xsmall" className="text-ui-fg-subtle uppercase tracking-wide">
        {label}
      </Text>
      <Text size="xlarge" weight="plus" className="mt-2">
        {value}
      </Text>
    </div>
  )
}

const OrdersMetricGrid = ({ stats }: { stats: AdminOrderStats }) => (
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
    <StatCard label="Total" value={stats.total} tone="blue" />
    <StatCard label="Pending" value={stats.pending} tone="orange" />
    <StatCard label="Completed" value={stats.completed} tone="green" />
    <StatCard label="Canceled" value={stats.canceled} tone="red" />
    <StatCard label="Needs action" value={stats.requires_action} tone="violet" />
    <StatCard label="Draft tests" value={stats.test_drafts} tone="grey" />
    <StatCard
      label="Awaiting payment"
      value={stats.pending_payment}
      tone="orange"
    />
    <StatCard
      label="Awaiting fulfillment"
      value={stats.pending_fulfillment}
      tone="blue"
    />
  </div>
)

export default OrdersMetricGrid
