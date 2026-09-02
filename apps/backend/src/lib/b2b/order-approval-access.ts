import { MedusaError } from "@medusajs/framework/utils"
import { roleHasPermission } from "../security/types"

type ApproverMember = {
  id: string
  role?: string | null
  is_primary?: boolean | null
  status?: string | null
} | null

/** Company admins, approvers, and primary contacts may act on pending orders. */
export function assertCanApproveCompanyOrders(member: ApproverMember) {
  if (!member || (member.status && member.status !== "active")) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Only active company approvers can approve or reject orders."
    )
  }

  const allowed =
    Boolean(member.is_primary) ||
    roleHasPermission(member.role, "orders.approve")

  if (!allowed) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Only company approvers can approve or reject orders."
    )
  }
}

export function memberCanApproveCompanyOrders(member: ApproverMember): boolean {
  try {
    assertCanApproveCompanyOrders(member)
    return true
  } catch {
    return false
  }
}
