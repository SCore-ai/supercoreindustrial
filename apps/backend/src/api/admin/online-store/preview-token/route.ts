import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPreviewSecret } from "../../../../lib/online-store/defaults"
import { ONLINE_STORE_MODULE } from "../../../../modules/online-store"
import OnlineStoreModuleService from "../../../../modules/online-store/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.getAdminSettings()

  const storefrontUrl =
    settings.storefront_url ?? process.env.STOREFRONT_URL ?? "http://localhost:8000"
  const token = getPreviewSecret()
  const base = storefrontUrl.replace(/\/$/, "")
  const previewUrl = `${base}/gb?online_store_preview=1&token=${encodeURIComponent(token)}`

  res.json({
    token,
    preview_url: previewUrl,
    storefront_url: storefrontUrl,
  })
}
