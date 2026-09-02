import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import { assignCustomerToGroup } from "../../../../../../lib/b2b/medusa-integrations"
import { auditFromRequest } from "../../../../../../lib/security/audit"
import inviteB2bCompanyMemberWorkflow from "../../../../../../workflows/b2b/invite-b2b-company-member"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params
  const company = await b2bService.retrieveCompanyWithMembers(id)
  res.json({ members: company.members })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as {
    email?: string | null
    customer_id?: string | null
    first_name?: string | null
    last_name?: string | null
    role?: "admin" | "buyer" | "approver"
    is_primary?: boolean
  }

  if (body.email?.trim()) {
    const { result } = await inviteB2bCompanyMemberWorkflow(req.scope).run({
      input: {
        company_id: id,
        email: body.email,
        role: body.role,
        first_name: body.first_name,
        last_name: body.last_name,
      },
    })

    await auditFromRequest(req, {
      actor_type: "admin",
      action: "b2b.member.invited",
      resource_type: "b2b_company_member",
      resource_id: result.member.id,
      company_id: id,
      summary: `Invited ${result.member.email ?? body.email} as ${result.member.role}`,
    })

    res.status(201).json({
      member: result.member,
      password_setup_sent: result.password_setup_sent,
    })
    return
  }

  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const member = await b2bService.addMember({
    company_id: id,
    ...body,
  })

  if (member.customer_id) {
    const company = await b2bService.retrieveCompanyWithMembers(id)
    if (company.customer_group_id) {
      await assignCustomerToGroup(
        req.scope,
        member.customer_id,
        company.customer_group_id
      )
    }
  }

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.member.added",
    resource_type: "b2b_company_member",
    resource_id: member.id,
    company_id: id,
    summary: `Added member ${member.email ?? member.id}`,
  })

  res.status(201).json({ member })
}
