export const SECURITY_SETTINGS_ID = "security_settings_default"

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
  metadata?: Record<string, unknown> | null
  created_at?: string
  updated_at?: string
}

export type UpdateSecuritySettingsInput = Partial<
  Omit<SecurityModuleSettings, "id" | "created_at" | "updated_at">
>

export type AuditActorType = "admin" | "customer" | "b2b_member" | "system"

export type CreateAuditLogInput = {
  actor_type?: AuditActorType
  actor_id?: string | null
  actor_email?: string | null
  action: string
  resource_type: string
  resource_id?: string | null
  company_id?: string | null
  ip_address?: string | null
  user_agent?: string | null
  summary?: string | null
  metadata?: Record<string, unknown> | null
}

export type SecurityPostureCheck = {
  id: string
  label: string
  description: string
  status: "pass" | "warn" | "fail" | "manual"
  category:
    | "rbac"
    | "auth"
    | "api"
    | "payments"
    | "infrastructure"
    | "data"
    | "monitoring"
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

export const DEFAULT_SECURITY_SETTINGS: Omit<
  SecurityModuleSettings,
  "id" | "created_at" | "updated_at"
> = {
  rbac_enforcement_enabled: true,
  company_scope_enforced: true,
  admin_mfa_required: true,
  storefront_mfa_required: false,
  sso_enabled: false,
  sso_provider: null,
  rate_limit_enabled: true,
  rate_limit_store_rpm: 120,
  rate_limit_auth_rpm: 20,
  audit_log_enabled: true,
  audit_log_retention_days: 90,
  audit_log_external_webhook: null,
  pci_tokenization_only: true,
  db_ssl_required: true,
  field_encryption_enabled: false,
  waf_enabled: false,
  waf_provider: null,
  metadata: { admin_mfa_v1: true },
}

export const B2B_ROLE_PERMISSIONS = {
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
} as const

export type B2bMemberRole = keyof typeof B2B_ROLE_PERMISSIONS
export type B2bPermission =
  (typeof B2B_ROLE_PERMISSIONS)[B2bMemberRole][number]

export function roleHasPermission(
  role: string | null | undefined,
  permission: B2bPermission
) {
  if (!role || !(role in B2B_ROLE_PERMISSIONS)) {
    return false
  }

  const permissions = B2B_ROLE_PERMISSIONS[role as B2bMemberRole] as readonly string[]
  return permissions.includes(permission)
}
