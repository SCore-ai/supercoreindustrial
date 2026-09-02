import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getExtensionsCatalog } from "../../../../lib/system/extensions/catalog-service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const refresh =
    req.query.refresh === "true" || req.query.refresh === "1"

  const catalog = await getExtensionsCatalog({ refresh })
  res.json(catalog)
}
