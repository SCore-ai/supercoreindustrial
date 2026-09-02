import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { previewManufacturerCsv } from "../../../../../../lib/catalog/manufacturer-import"
import { requireManufacturer } from "../../../../../../lib/catalog/manufacturers"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const manufacturerId = req.params.manufacturer
  try {
    const manufacturer = requireManufacturer(manufacturerId)
    const body = (req.body || {}) as {
      csv?: string
      filename?: string
      source_currency?: string
      limit?: number
    }

    if (!body.csv?.trim()) {
      res.status(400).json({ message: "csv content is required" })
      return
    }

    const preview = await previewManufacturerCsv(req.scope, {
      manufacturer: manufacturer.id,
      csv: body.csv,
      filename: body.filename,
      source_currency: body.source_currency ?? manufacturer.source_currency,
      limit: body.limit ?? 40,
    })
    res.json(preview)
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Preview failed",
    })
  }
}
