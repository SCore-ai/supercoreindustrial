import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { toStoreAuthOptions } from "../../../../lib/security/store-auth-options"
import { SECURITY_MODULE } from "../../../../modules/security"
import SecurityModuleService from "../../../../modules/security/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const securityService: SecurityModuleService = req.scope.resolve(SECURITY_MODULE)
  const settings = await securityService.getSettings()

  res.json({
    auth: toStoreAuthOptions(settings),
  })
}
