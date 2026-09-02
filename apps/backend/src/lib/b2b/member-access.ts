import { MedusaError } from "@medusajs/framework/utils"
import { roleHasPermission } from "../security/types"

type MemberLike = {
  id?: string
  role?: string | null
  is_primary?: boolean | null
  status?: string | null
} | null

export function memberCanManageMembers(member: MemberLike): boolean {
  if (!member || (member.status && member.status !== "active")) {
    return false
  }

  return (
    Boolean(member.is_primary) ||
    roleHasPermission(member.role, "members.manage")
  )
}

export function assertCanManageMembers(member: MemberLike) {
  if (!memberCanManageMembers(member)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Only company admins can invite or manage team members."
    )
  }
}
