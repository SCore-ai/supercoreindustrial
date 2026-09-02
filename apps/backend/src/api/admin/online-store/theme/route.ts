import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ONLINE_STORE_MODULE } from "../../../../modules/online-store"
import OnlineStoreModuleService from "../../../../modules/online-store/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.getAdminSettings()

  res.json({ settings })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.updateTheme(req.body ?? {})

  res.json({ settings })
}
