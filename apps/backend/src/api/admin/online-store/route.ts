import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { toStorefrontPayload } from "../../../lib/online-store/storefront-payload"
import { ONLINE_STORE_MODULE } from "../../../modules/online-store"
import OnlineStoreModuleService from "../../../modules/online-store/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.getAdminSettings()
  const storefront = toStorefrontPayload(settings)

  res.json({
    ...storefront,
    has_unpublished_changes: settings.has_unpublished_changes,
    published_at: settings.published_at,
  })
}
