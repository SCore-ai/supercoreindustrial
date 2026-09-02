import { model } from "@medusajs/framework/utils"

const Quote = model.define("quote", {
  id: model.id().primaryKey(),
  status: model.enum(["draft", "submitted"]).default("draft"),
  email: model.text().nullable(),
  customer_id: model.text().nullable(),
  company: model.text().nullable(),
  project: model.text().nullable(),
  notes: model.text().nullable(),
  region_id: model.text().nullable(),
  company_id: model.text().nullable(),
  currency_code: model.text().nullable(),
  valid_until: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default Quote
