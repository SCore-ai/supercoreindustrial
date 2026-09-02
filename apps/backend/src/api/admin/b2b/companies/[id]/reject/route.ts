import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import rejectB2bCompanyWorkflow from "../../../../../../workflows/b2b/reject-b2b-company"
import { auditFromRequest } from "../../../../../../lib/security/audit"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { admin_notes?: string | null }

  const { result: company } = await rejectB2bCompanyWorkflow(req.scope).run({
    input: {
      company_id: id,
      admin_notes: body.admin_notes,
    },
  })

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.company.rejected",
    resource_type: "b2b_company",
    resource_id: company.id,
    company_id: company.id,
    summary: `Rejected customer ${company.name}`,
  })

  res.json({ company })
}
