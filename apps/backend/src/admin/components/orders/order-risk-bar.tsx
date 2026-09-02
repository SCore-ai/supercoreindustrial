import { Text } from "@medusajs/ui"
import type { AdminOrderRisk } from "../../lib/orders-types"

const LEVEL_COLORS = {
  low: "bg-emerald-500",
  medium: "bg-orange-400",
  high: "bg-red-500",
} as const

const OrderRiskBar = ({ risk }: { risk: AdminOrderRisk }) => {
  const markerPosition =
    risk.level === "low" ? "16%" : risk.level === "medium" ? "50%" : "84%"

  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Text size="small" weight="plus">
          Order risk
        </Text>
        {risk.three_ds_authenticated && (
          <span className="rounded-full bg-ui-bg-subtle px-2 py-1 text-xs text-ui-fg-subtle">
            3DS authenticated
          </span>
        )}
      </div>

      <div className="relative mb-3 h-2 overflow-hidden rounded-full">
        <div className="absolute inset-0 flex">
          <div className={`h-full flex-1 ${LEVEL_COLORS.low}`} />
          <div className={`h-full flex-1 ${LEVEL_COLORS.medium}`} />
          <div className={`h-full flex-1 ${LEVEL_COLORS.high}`} />
        </div>
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ui-fg-base shadow"
          style={{ left: markerPosition }}
        />
      </div>

      <div className="mb-1 flex justify-between text-[11px] uppercase tracking-wide text-ui-fg-subtle">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>

      <Text size="small" weight="plus" className="mt-3">
        {risk.headline}
      </Text>
      <Text size="small" className="mt-1 text-ui-fg-subtle">
        {risk.message}
      </Text>
    </div>
  )
}

export default OrderRiskBar
