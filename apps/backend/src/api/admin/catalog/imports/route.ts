import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATALOG_MODULE } from "../../../../modules/catalog"
import CatalogModuleService from "../../../../modules/catalog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const catalog: CatalogModuleService = req.scope.resolve(CATALOG_MODULE)
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const result = await catalog.listImportJobs(limit, offset)
  res.json(result)
}
