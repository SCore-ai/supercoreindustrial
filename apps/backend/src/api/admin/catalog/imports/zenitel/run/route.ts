import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { runManufacturerImport } from "../../../../../../lib/catalog/manufacturer-import"

/** @deprecated Prefer /admin/catalog/imports/[manufacturer]/run */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    csv?: string
    filename?: string
    source_currency?: string
    job_id?: string
  }

  if (!body.csv?.trim()) {
    res.status(400).json({ message: "csv content is required" })
    return
  }

  try {
    const result = await runManufacturerImport(req.scope, {
      manufacturer: "zenitel",
      csv: body.csv,
      filename: body.filename,
      source_currency: body.source_currency ?? "eur",
      job_id: body.job_id,
    })
    res.json(result)
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Import failed",
    })
  }
}
