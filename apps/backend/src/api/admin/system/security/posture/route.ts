import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { evaluateSecurityPosture } from "../../../../../lib/security/posture"
import { SECURITY_MODULE } from "../../../../../modules/security"
import SecurityModuleService from "../../../../../modules/security/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const securityService: SecurityModuleService = req.scope.resolve(SECURITY_MODULE)
  const settings = await securityService.getSettings()
  const posture = evaluateSecurityPosture(settings)

  res.json({ posture })
}
