import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { auditFromRequest } from "../../../../../../lib/security/audit"
import assignCompanyCustomerGroupWorkflow from "../../../../../../workflows/b2b/assign-company-customer-group"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { customer_group_id?: string | null }

  if (body.customer_group_id === undefined) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "customer_group_id is required"
    )
  }

  const { result: company } = await assignCompanyCustomerGroupWorkflow(
    req.scope
  ).run({
    input: {
      company_id: id,
      customer_group_id: body.customer_group_id,
    },
  })

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.company.group_assigned",
    resource_type: "b2b_company",
    resource_id: company.id,
    company_id: company.id,
    summary: body.customer_group_id
      ? `Assigned group ${body.customer_group_id} to ${company.name}`
      : `Cleared group on ${company.name}`,
  })

  res.json({ company })
}
