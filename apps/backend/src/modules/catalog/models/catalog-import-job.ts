import { model } from "@medusajs/framework/utils"

const CatalogImportJob = model.define("catalog_import_job", {
  id: model.id().primaryKey(),
  manufacturer: model.text(),
  source_currency: model.text().default("eur"),
  target_currency: model.text().default("gbp"),
  status: model
    .enum(["draft", "previewed", "running", "completed", "failed"])
    .default("draft"),
  filename: model.text().nullable(),
  total_rows: model.number().default(0),
  imported_count: model.number().default(0),
  skipped_count: model.number().default(0),
  error_count: model.number().default(0),
  fx_rate_used: model.float().nullable(),
  summary: model.json().nullable(),
  error_log: model.json().nullable(),
  metadata: model.json().nullable(),
})

export default CatalogImportJob
