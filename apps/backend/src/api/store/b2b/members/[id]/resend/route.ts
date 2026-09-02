import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../../lib/b2b/customer-context"
import { serializeStoreMember } from "../../../../../../lib/b2b/invite-company-member"
import { assertCanManageMembers } from "../../../../../../lib/b2b/member-access"
import { auditFromRequest } from "../../../../../../lib/security/audit"
import { requireB2bPermission } from "../../../../../../lib/security/rbac"
import resendB2bMemberInviteWorkflow from "../../../../../../workflows/b2b/resend-b2b-member-invite"

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

    const { id } = req.params
    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const member = await b2bService.retrieveB2bCompanyMember(id)

    if (member.company_id !== context.companyId) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Cross-company access is not permitted."
      )
    }

    const { result } = await resendB2bMemberInviteWorkflow(req.scope).run({
      input: { member_id: id },
    })

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: customerId,
      actor_email: context.email,
      action: "b2b.member.invite_resent",
      resource_type: "b2b_company_member",
      resource_id: id,
      company_id: context.companyId,
      summary: `Resent invite to ${result.member.email ?? id}`,
    })

    res.json({
      member: serializeStoreMember(result.member),
      password_setup_sent: result.password_setup_sent,
    })
  } catch (error) {
    if (error instanceof MedusaError) {
      if (error.type === MedusaError.Types.UNAUTHORIZED) {
        res.status(401).json({ message: error.message })
        return
      }

      if (error.type === MedusaError.Types.NOT_ALLOWED) {
        res.status(403).json({ message: error.message })
        return
      }

      if (error.type === MedusaError.Types.INVALID_DATA) {
        res.status(400).json({ message: error.message })
        return
      }
    }

    throw error
  }
}
