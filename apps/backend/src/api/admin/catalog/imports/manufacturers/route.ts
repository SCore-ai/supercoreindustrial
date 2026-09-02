import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MANUFACTURER_LIST } from "../../../../../lib/catalog/manufacturers"

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  res.json({
    manufacturers: MANUFACTURER_LIST.map((m) => ({
      id: m.id,
      name: m.name,
      source_currency: m.source_currency,
      target_currency: m.target_currency,
      description: m.description,
      default_filename: m.default_filename,
      sample_csv: m.sample_csv,
      fx_label: `${m.source_currency.toUpperCase()} → ${m.target_currency.toUpperCase()}`,
    })),
  })
}
