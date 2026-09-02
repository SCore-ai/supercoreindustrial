import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../lib/b2b/customer-context"
import { serializeStoreMember } from "../../../../../lib/b2b/invite-company-member"
import { assertCanManageMembers } from "../../../../../lib/b2b/member-access"
import { auditFromRequest } from "../../../../../lib/security/audit"
import { requireB2bPermission } from "../../../../../lib/security/rbac"

function handleStoreMemberError(error: unknown, res: MedusaResponse) {
  if (error instanceof MedusaError) {
    if (error.type === MedusaError.Types.UNAUTHORIZED) {
      res.status(401).json({ message: error.message })
      return true
    }

    if (error.type === MedusaError.Types.NOT_ALLOWED) {
      res.status(403).json({ message: error.message })
      return true
    }

    if (error.type === MedusaError.Types.INVALID_DATA) {
      res.status(400).json({ message: error.message })
      return true
    }

    if (error.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({ message: error.message })
      return true
    }
  }

  return false
}

async function requireCompanyMember(
  req: MedusaRequest,
  memberId: string
) {
  const customerId = requireAuthenticatedCustomer(req)
  const context = await resolveStoreB2bContext(req.scope, customerId)
  await requireB2bPermission(req.scope, context.member?.role, "members.manage")
  assertCanManageMembers(context.member)

  if (!context.companyId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "No trade company is linked to this account."
    )
  }

  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const member = await b2bService.retrieveB2bCompanyMember(memberId)

  if (member.company_id !== context.companyId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cross-company access is not permitted."
    )
  }

  return { context, b2bService, member }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const { context, b2bService, member } = await requireCompanyMember(req, id)
    const body = (req.body || {}) as {
      role?: "admin" | "buyer" | "approver"
      status?: "active" | "invited" | "disabled"
    }

    if (member.id === context.member?.id && body.status === "disabled") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "You cannot disable your own access."
      )
    }

    const updated = await b2bService.updateMember({
      id: member.id,
      role: body.role,
      status: body.status,
    })

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: context.customerId,
      actor_email: context.email,
      action: "b2b.member.updated",
      resource_type: "b2b_company_member",
      resource_id: updated.id,
      company_id: context.companyId,
      summary: `Updated member ${updated.email ?? updated.id}`,
      metadata: { role: body.role, status: body.status },
    })

    res.json({ member: serializeStoreMember(updated) })
  } catch (error) {
    if (handleStoreMemberError(error, res)) {
      return
    }

    throw error
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const { context, b2bService, member } = await requireCompanyMember(req, id)

    if (member.id === context.member?.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "You cannot remove yourself from the company."
      )
    }

    const result = await b2bService.removeMember(member.id)

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: context.customerId,
      actor_email: context.email,
      action: "b2b.member.removed",
      resource_type: "b2b_company_member",
      resource_id: member.id,
      company_id: context.companyId,
      summary: `Removed member ${member.email ?? member.id}`,
    })

    res.json(result)
  } catch (error) {
    if (handleStoreMemberError(error, res)) {
      return
    }

    throw error
  }
}
