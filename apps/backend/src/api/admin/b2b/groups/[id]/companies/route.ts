import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { auditFromRequest } from "../../../../../../lib/security/audit"
import assignCompanyCustomerGroupWorkflow from "../../../../../../workflows/b2b/assign-company-customer-group"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { company_id?: string }

  if (!body.company_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "company_id is required"
    )
  }

  const { result: company } = await assignCompanyCustomerGroupWorkflow(
    req.scope
  ).run({
    input: {
      company_id: body.company_id,
      customer_group_id: id,
    },
  })

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.group.company_assigned",
    resource_type: "b2b_company",
    resource_id: company.id,
    company_id: company.id,
    summary: `Assigned company ${company.name} to group ${id}`,
  })

  res.json({ company })
}
