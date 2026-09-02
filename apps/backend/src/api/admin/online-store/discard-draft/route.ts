import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ONLINE_STORE_MODULE } from "../../../../modules/online-store"
import OnlineStoreModuleService from "../../../../modules/online-store/service"

export async function POST(_req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = _req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.discardDraft()

  res.json({
    settings,
    message: "Draft discarded",
  })
}
