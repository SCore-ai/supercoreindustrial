import { model } from "@medusajs/framework/utils"

const B2bMessage = model.define("b2b_message", {
  id: model.id().primaryKey(),
  conversation_id: model.text(),
  sender_type: model.enum(["admin", "customer", "system"]).default("customer"),
  sender_id: model.text().nullable(),
  sender_name: model.text().nullable(),
  body: model.text(),
  metadata: model.json().nullable(),
})

export default B2bMessage
