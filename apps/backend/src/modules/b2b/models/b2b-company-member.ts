import { model } from "@medusajs/framework/utils"

const B2bCompanyMember = model.define("b2b_company_member", {
  id: model.id().primaryKey(),
  company_id: model.text(),
  customer_id: model.text().nullable(),
  email: model.text().nullable(),
  first_name: model.text().nullable(),
  last_name: model.text().nullable(),
  role: model.enum(["admin", "buyer", "approver"]).default("buyer"),
  status: model.enum(["active", "invited", "disabled"]).default("active"),
  is_primary: model.boolean().default(false),
  metadata: model.json().nullable(),
})

export default B2bCompanyMember
