import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CATALOG_MODULE } from "../../../../../modules/catalog"
import CatalogModuleService from "../../../../../modules/catalog/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const catalog: CatalogModuleService = req.scope.resolve(CATALOG_MODULE)
  const body = (req.body || {}) as {
    amount?: number
    from?: string
    to?: string
  }

  if (!(Number(body.amount) >= 0) || !body.from || !body.to) {
    res.status(400).json({ message: "amount, from and to are required" })
    return
  }

  try {
    const result = await catalog.convertMoney({
      amount: Number(body.amount),
      from: body.from,
      to: body.to,
    })
    res.json(result)
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Conversion failed",
    })
  }
}
