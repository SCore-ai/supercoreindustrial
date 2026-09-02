import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ONLINE_STORE_MODULE } from "../../../../modules/online-store"
import OnlineStoreModuleService from "../../../../modules/online-store/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.getAdminSettings()

  res.json({
    homepage: settings.homepage,
    has_unpublished_changes: settings.has_unpublished_changes,
    published_at: settings.published_at,
    updated_at: settings.updated_at,
  })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.updateHomepage(req.body ?? {})

  res.json({
    homepage: settings.homepage,
    has_unpublished_changes: settings.has_unpublished_changes,
    published_at: settings.published_at,
    updated_at: settings.updated_at,
  })
}
