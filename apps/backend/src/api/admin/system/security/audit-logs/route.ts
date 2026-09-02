import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SECURITY_MODULE } from "../../../../../modules/security"
import SecurityModuleService from "../../../../../modules/security/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const securityService: SecurityModuleService = req.scope.resolve(SECURITY_MODULE)
  const action = req.query.action as string | undefined
  const company_id = req.query.company_id as string | undefined
  const resource_type = req.query.resource_type as string | undefined
  const limit = req.query.limit ? Number(req.query.limit) : 25
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const { logs, count } = await securityService.listAuditLogsForAdmin({
    action,
    company_id,
    resource_type,
    limit,
    offset,
  })

  res.json({ logs, count, limit, offset })
}
