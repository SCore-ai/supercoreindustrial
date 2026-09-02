import { model } from "@medusajs/framework/utils"

const B2bConversation = model.define("b2b_conversation", {
  id: model.id().primaryKey(),
  company_id: model.text().nullable(),
  quote_id: model.text().nullable(),
  order_id: model.text().nullable(),
  subject: model.text(),
  status: model.enum(["open", "closed", "archived"]).default("open"),
  created_by: model.enum(["admin", "customer"]).default("customer"),
  customer_id: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default B2bConversation
