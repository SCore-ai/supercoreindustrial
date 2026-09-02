import { model } from "@medusajs/framework/utils"

const B2bOrderApproval = model.define("b2b_order_approval", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  company_id: model.text(),
  requested_by_member_id: model.text().nullable(),
  approved_by_member_id: model.text().nullable(),
  status: model
    .enum(["pending", "approved", "rejected"])
    .default("pending"),
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default B2bOrderApproval
