import { Badge } from "@medusajs/ui"
import { orderStatusLabel } from "../../lib/orders-utils"

const STATUS_COLORS: Record<
  string,
  "green" | "orange" | "red" | "blue" | "grey" | "purple"
> = {
  pending: "orange",
  completed: "green",
  canceled: "red",
  archived: "grey",
  requires_action: "purple",
}

export const OrderStatusBadge = ({ status }: { status: string }) => (
  <Badge color={STATUS_COLORS[status] ?? "grey"} size="2xsmall">
    {orderStatusLabel(status)}
  </Badge>
)

export default OrderStatusBadge
