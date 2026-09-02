import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import { toStorefrontSettings } from "../../../../lib/b2b/settings-types"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()

  res.json({
    settings: toStorefrontSettings(settings),
  })
}
