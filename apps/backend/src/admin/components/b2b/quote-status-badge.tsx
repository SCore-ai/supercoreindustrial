import { Badge } from "@medusajs/ui"
import { QuoteAdminStatus } from "../../lib/types"

const ADMIN_STATUS_LABELS: Record<QuoteAdminStatus, string> = {
  new: "New",
  in_review: "In review",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  cancelled: "Archived",
}

const ADMIN_STATUS_COLOR: Record<
  QuoteAdminStatus,
  "green" | "orange" | "blue" | "purple" | "red" | "grey"
> = {
  new: "blue",
  in_review: "orange",
  quoted: "purple",
  won: "green",
  lost: "red",
  cancelled: "grey",
}

type QuoteStatusBadgeProps = {
  status: "draft" | "submitted"
  adminStatus?: QuoteAdminStatus
}

export const QuoteStatusBadge = ({
  status,
  adminStatus,
}: QuoteStatusBadgeProps) => {
  if (adminStatus) {
    return (
      <Badge color={ADMIN_STATUS_COLOR[adminStatus]} size="2xsmall">
        {ADMIN_STATUS_LABELS[adminStatus]}
      </Badge>
    )
  }

  return (
    <Badge color={status === "submitted" ? "green" : "grey"} size="2xsmall">
      {status === "submitted" ? "Submitted" : "Draft"}
    </Badge>
  )
}

export default QuoteStatusBadge
