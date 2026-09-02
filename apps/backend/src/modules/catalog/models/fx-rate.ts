import { model } from "@medusajs/framework/utils"

const FxRate = model.define("fx_rate", {
  id: model.id().primaryKey(),
  from_currency: model.text(),
  to_currency: model.text(),
  rate: model.float(),
  source: model.text().default("manual"),
  is_active: model.boolean().default(true),
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default FxRate
