import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { evaluateSecurityPosture } from "../../../../lib/security/posture"
import { writeAuditLog, getRequestAuditContext } from "../../../../lib/security/audit"
import { SECURITY_MODULE } from "../../../../modules/security"
import SecurityModuleService from "../../../../modules/security/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const securityService: SecurityModuleService = req.scope.resolve(SECURITY_MODULE)
  const settings = await securityService.getSettings()
  const posture = evaluateSecurityPosture(settings)

  res.json({ settings, posture })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const securityService: SecurityModuleService = req.scope.resolve(SECURITY_MODULE)
  const body = (req.body || {}) as Record<string, unknown>
  const settings = await securityService.updateSettings(body)

  const auditContext = getRequestAuditContext(req)
  await writeAuditLog(req.scope, {
    ...auditContext,
    actor_type: "admin",
    action: "security.settings.updated",
    resource_type: "security_settings",
    resource_id: settings.id,
    summary: "Security settings updated",
    metadata: { changed_keys: Object.keys(body) },
  })

  res.json({
    settings,
    posture: evaluateSecurityPosture(settings),
  })
}
