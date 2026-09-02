import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../lib/b2b/customer-context"
import {
  serializeStoreMember,
} from "../../../../lib/b2b/invite-company-member"
import {
  assertCanManageMembers,
  memberCanManageMembers,
} from "../../../../lib/b2b/member-access"
import { auditFromRequest } from "../../../../lib/security/audit"
import { requireB2bPermission } from "../../../../lib/security/rbac"
import inviteB2bCompanyMemberWorkflow from "../../../../workflows/b2b/invite-b2b-company-member"

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
  }

  return false
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)

    if (!context.companyId || !context.company) {
      res.json({
        members: [],
        count: 0,
        permissions: { can_manage_members: false },
        company: null,
      })
      return
    }

    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const company = await b2bService.retrieveCompanyWithMembers(
      context.companyId
    )

    res.json({
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
      members: company.members.map(serializeStoreMember),
      count: company.members.length,
      permissions: {
        can_manage_members: memberCanManageMembers(context.member),
      },
    })
  } catch (error) {
    if (handleStoreMemberError(error, res)) {
      return
    }

    throw error
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
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

    if (context.company?.status !== "approved") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Team invites are available after the trade account is approved."
      )
    }

    const body = (req.body || {}) as {
      email?: string
      role?: "admin" | "buyer" | "approver"
      first_name?: string | null
      last_name?: string | null
    }

    const { result } = await inviteB2bCompanyMemberWorkflow(req.scope).run({
      input: {
        company_id: context.companyId,
        email: body.email ?? "",
        role: body.role,
        first_name: body.first_name,
        last_name: body.last_name,
      },
    })

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: customerId,
      actor_email: context.email,
      action: "b2b.member.invited",
      resource_type: "b2b_company_member",
      resource_id: result.member.id,
      company_id: context.companyId,
      summary: `Invited ${result.member.email ?? body.email} as ${result.member.role}`,
    })

    res.status(201).json({
      member: serializeStoreMember(result.member),
      password_setup_sent: result.password_setup_sent,
    })
  } catch (error) {
    if (handleStoreMemberError(error, res)) {
      return
    }

    throw error
  }
}
