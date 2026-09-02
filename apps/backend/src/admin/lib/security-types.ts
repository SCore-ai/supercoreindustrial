export type SecuritySsoProvider = "saml" | "oauth" | "oidc"
export type SecurityWafProvider = "cloudflare" | "aws" | "other"

export type SecurityModuleSettings = {
  id: string
  rbac_enforcement_enabled: boolean
  company_scope_enforced: boolean
  admin_mfa_required: boolean
  storefront_mfa_required: boolean
  sso_enabled: boolean
  sso_provider: SecuritySsoProvider | null
  rate_limit_enabled: boolean
  rate_limit_store_rpm: number
  rate_limit_auth_rpm: number
  audit_log_enabled: boolean
  audit_log_retention_days: number
  audit_log_external_webhook: string | null
  pci_tokenization_only: boolean
  db_ssl_required: boolean
  field_encryption_enabled: boolean
  waf_enabled: boolean
  waf_provider: SecurityWafProvider | null
}

export type SecurityPostureCheck = {
  id: string
  label: string
  description: string
  status: "pass" | "warn" | "fail" | "manual"
  category: string
  recommendation?: string
}

export type SecurityPostureReport = {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  checks: SecurityPostureCheck[]
  summary: {
    pass: number
    warn: number
    fail: number
    manual: number
  }
}

export type B2bRolePermissions = {
  admin: string[]
  approver: string[]
  buyer: string[]
}

export const B2B_ROLE_PERMISSIONS: B2bRolePermissions = {
  admin: [
    "company.manage",
    "members.manage",
    "orders.place",
    "orders.approve",
    "orders.view",
    "quotes.manage",
    "quotes.view",
    "pricing.view",
    "conversations.manage",
    "conversations.view",
  ],
  approver: [
    "orders.approve",
    "orders.view",
    "quotes.view",
    "pricing.view",
    "conversations.view",
  ],
  buyer: [
    "orders.place",
    "orders.view",
    "quotes.create",
    "quotes.view",
    "pricing.view",
    "conversations.view",
  ],
}
