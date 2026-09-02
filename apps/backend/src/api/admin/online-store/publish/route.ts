import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { toStorefrontPayload } from "../../../../lib/online-store/storefront-payload"
import { ONLINE_STORE_MODULE } from "../../../../modules/online-store"
import OnlineStoreModuleService from "../../../../modules/online-store/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.publish()

  res.json({
    settings,
    storefront: toStorefrontPayload(settings),
    message: "Online store changes published",
  })
}
