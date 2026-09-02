import { model } from "@medusajs/framework/utils"

const AuditLog = model.define("audit_log", {
  id: model.id().primaryKey(),
  actor_type: model
    .enum(["admin", "customer", "b2b_member", "system"])
    .default("system"),
  actor_id: model.text().nullable(),
  actor_email: model.text().nullable(),
  action: model.text(),
  resource_type: model.text(),
  resource_id: model.text().nullable(),
  company_id: model.text().nullable(),
  ip_address: model.text().nullable(),
  user_agent: model.text().nullable(),
  summary: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default AuditLog
