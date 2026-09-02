import { model } from "@medusajs/framework/utils"

const SecuritySettings = model.define("security_settings", {
  id: model.id().primaryKey(),
  rbac_enforcement_enabled: model.boolean().default(true),
  company_scope_enforced: model.boolean().default(true),
  admin_mfa_required: model.boolean().default(false),
  storefront_mfa_required: model.boolean().default(false),
  sso_enabled: model.boolean().default(false),
  sso_provider: model.enum(["saml", "oauth", "oidc"]).nullable(),
  rate_limit_enabled: model.boolean().default(true),
  rate_limit_store_rpm: model.number().default(120),
  rate_limit_auth_rpm: model.number().default(20),
  audit_log_enabled: model.boolean().default(true),
  audit_log_retention_days: model.number().default(90),
  audit_log_external_webhook: model.text().nullable(),
  pci_tokenization_only: model.boolean().default(true),
  db_ssl_required: model.boolean().default(true),
  field_encryption_enabled: model.boolean().default(false),
  waf_enabled: model.boolean().default(false),
  waf_provider: model.enum(["cloudflare", "aws", "other"]).nullable(),
  metadata: model.json().nullable(),
})

export default SecuritySettings
