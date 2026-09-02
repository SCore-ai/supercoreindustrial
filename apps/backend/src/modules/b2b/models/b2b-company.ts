import { model } from "@medusajs/framework/utils"

const B2bCompany = model.define("b2b_company", {
  id: model.id().primaryKey(),
  name: model.text(),
  legal_name: model.text().nullable(),
  email: model.text(),
  phone: model.text().nullable(),
  vat_number: model.text().nullable(),
  registration_number: model.text().nullable(),
  website: model.text().nullable(),
  country_code: model.text().nullable(),
  status: model
    .enum(["pending", "approved", "rejected", "suspended", "archived"])
    .default("pending"),
  customer_group_id: model.text().nullable(),
  primary_customer_id: model.text().nullable(),
  approved_at: model.dateTime().nullable(),
  rejected_at: model.dateTime().nullable(),
  admin_notes: model.text().nullable(),
  require_order_approval: model.boolean().default(true),
  metadata: model.json().nullable(),
})

export default B2bCompany
