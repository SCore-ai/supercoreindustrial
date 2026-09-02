import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import approveB2bCompanyWorkflow from "../../../../../../workflows/b2b/approve-b2b-company"
import { auditFromRequest } from "../../../../../../lib/security/audit"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { customer_group_id?: string | null }

  const { result: company } = await approveB2bCompanyWorkflow(req.scope).run({
    input: {
      company_id: id,
      customer_group_id: body.customer_group_id,
    },
  })

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.company.approved",
    resource_type: "b2b_company",
    resource_id: company.id,
    company_id: company.id,
    summary: `Approved customer ${company.name}`,
  })

  res.json({ company })
}
