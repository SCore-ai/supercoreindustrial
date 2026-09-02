import { Badge } from "@medusajs/ui"
import { CompanyStatus } from "../../lib/types"

const LABELS: Record<CompanyStatus, string> = {
  pending: "Pending approval",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  archived: "Archived",
}

const COLORS: Record<
  CompanyStatus,
  "green" | "orange" | "blue" | "red" | "grey"
> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
  suspended: "grey",
  archived: "grey",
}

export const CompanyStatusBadge = ({ status }: { status: CompanyStatus }) => {
  return (
    <Badge color={COLORS[status]} size="2xsmall">
      {LABELS[status]}
    </Badge>
  )
}

export default CompanyStatusBadge
