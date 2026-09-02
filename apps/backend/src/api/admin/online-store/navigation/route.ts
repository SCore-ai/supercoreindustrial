import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getProductsMenuPreview } from "../../../../lib/online-store/catalog-navigation"
import { ONLINE_STORE_MODULE } from "../../../../modules/online-store"
import OnlineStoreModuleService from "../../../../modules/online-store/service"

function navigationResponse(
  settings: Awaited<ReturnType<OnlineStoreModuleService["getAdminSettings"]>>,
  productsMenu: Awaited<ReturnType<typeof getProductsMenuPreview>>
) {
  return {
    main_navigation: settings.main_navigation,
    contact_menu: settings.contact_menu,
    partner_catalog: settings.partner_catalog,
    footer: settings.footer,
    mega_menu_layout: settings.mega_menu_layout,
    products_menu: productsMenu,
    updated_at: settings.updated_at,
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.getAdminSettings()
  const productsMenu = await getProductsMenuPreview(
    req.scope,
    settings.partner_catalog
  )

  res.json(navigationResponse(settings, productsMenu))
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const settings = await service.updateNavigation(req.body ?? {})
  const productsMenu = await getProductsMenuPreview(
    req.scope,
    settings.partner_catalog
  )

  res.json(navigationResponse(settings, productsMenu))
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: OnlineStoreModuleService = req.scope.resolve(ONLINE_STORE_MODULE)
  const action = (req.body as { action?: string } | undefined)?.action

  if (action === "reset") {
    const settings = await service.resetNavigationToDefaults()
    const productsMenu = await getProductsMenuPreview(
      req.scope,
      settings.partner_catalog
    )
    return res.json(navigationResponse(settings, productsMenu))
  }

  res.status(400).json({ message: "Unsupported action" })
}
