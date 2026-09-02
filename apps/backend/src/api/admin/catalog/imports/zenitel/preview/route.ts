import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { previewManufacturerCsv } from "../../../../../../lib/catalog/manufacturer-import"

/** @deprecated Prefer /admin/catalog/imports/zenitel/preview via [manufacturer] route */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
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

  try {
    const preview = await previewManufacturerCsv(req.scope, {
      manufacturer: "zenitel",
      csv: body.csv,
      filename: body.filename,
      source_currency: body.source_currency ?? "eur",
      limit: body.limit ?? 40,
    })
    res.json(preview)
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Preview failed",
    })
  }
}
