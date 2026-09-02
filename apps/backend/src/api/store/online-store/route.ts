import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { isValidPreviewToken } from "../../../lib/online-store/defaults"
import { toStorefrontPayload } from "../../../lib/online-store/storefront-payload"
import { ONLINE_STORE_MODULE } from "../../../modules/online-store"
import OnlineStoreModuleService from "../../../modules/online-store/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)

  const previewParam = req.query.preview
  const tokenParam = req.query.token
  const previewRequested =
    previewParam === "1" || previewParam === "true"
  const preview =
    previewRequested && isValidPreviewToken(String(tokenParam ?? ""))

  const settings = await service.getResolvedSettings({ preview })

  res.json({
    settings: toStorefrontPayload(settings),
    preview,
  })
}
