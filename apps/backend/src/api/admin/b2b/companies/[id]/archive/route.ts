import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import { getRequestAuditContext, writeAuditLog } from "../../../../../../lib/security/audit"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params

  const company = await b2bService.archiveCompany(id)

  const auditContext = getRequestAuditContext(req)
  await writeAuditLog(req.scope, {
    ...auditContext,
    actor_type: "admin",
    action: "b2b.company.archived",
    resource_type: "b2b_company",
    resource_id: id,
    company_id: id,
    summary: `Archived customer ${company.name}`,
  })

  res.json({ company })
}