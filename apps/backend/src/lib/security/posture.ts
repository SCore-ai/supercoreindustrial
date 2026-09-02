import type {
  SecurityModuleSettings,
  SecurityPostureCheck,
  SecurityPostureReport,
} from "./types"
import {
  paymentProviderPostureStatus,
  paymentProviderRecommendation,
} from "../payments/stripe-env"

function adminMfaStatus(
  settings: SecurityModuleSettings
): SecurityPostureCheck["status"] {
  if (process.env.ADMIN_MFA_BYPASS === "true") {
    return "warn"
  }

  return settings.admin_mfa_required ? "pass" : "warn"
}

function adminMfaRecommendation(settings: SecurityModuleSettings) {
  if (process.env.ADMIN_MFA_BYPASS === "true") {
    return "Unset ADMIN_MFA_BYPASS so admin users must verify the email code after login."
  }

  if (!settings.admin_mfa_required) {
    return "Enable Require admin MFA. Codes are sent to the admin user's email via B2B SMTP settings."
  }

  return undefined
}

function isStrongSecret(value: string | undefined, minLength = 32) {
  return Boolean(value && value.length >= minLength && value !== "supersecret")
}

function databaseUsesSsl() {
  const mode = (process.env.DATABASE_SSLMODE ?? "").trim().toLowerCase()
  const url = process.env.DATABASE_URL ?? ""
  return (
    mode === "require" ||
    mode === "verify-ca" ||
    mode === "verify-full" ||
    url.includes("sslmode=require") ||
    url.includes("sslmode=verify-ca") ||
    url.includes("sslmode=verify-full") ||
    url.includes("ssl=true") ||
    url.includes("uselibpqcompat=true")
  )
}

export function evaluateSecurityPosture(
  settings: SecurityModuleSettings
): SecurityPostureReport {
  const checks: SecurityPostureCheck[] = [
    {
      id: "rbac-enforcement",
      label: "B2B RBAC enforcement",
      description: "Company members are restricted to role-based permissions.",
      status: settings.rbac_enforcement_enabled ? "pass" : "warn",
      category: "rbac",
      recommendation: "Keep RBAC enforcement enabled for all B2B store routes.",
    },
    {
      id: "company-scope",
      label: "Company scope isolation",
      description: "Buyers only access data belonging to their company.",
      status: settings.company_scope_enforced ? "pass" : "fail",
      category: "rbac",
      recommendation: "Enable company scope enforcement to prevent cross-company data leaks.",
    },
    {
      id: "admin-mfa",
      label: "Admin MFA",
      description:
        "Two-factor authentication for admin users via email OTP after password login.",
      status: adminMfaStatus(settings),
      category: "auth",
      recommendation: adminMfaRecommendation(settings),
    },
    {
      id: "storefront-mfa",
      label: "B2B storefront MFA",
      description: "Email one-time code after password login for trade accounts.",
      status: settings.storefront_mfa_required ? "pass" : "warn",
      category: "auth",
      recommendation:
        "Enable storefront MFA so buyers and approvers confirm login by email OTP.",
    },
    {
      id: "sso",
      label: "Enterprise SSO",
      description: "SAML/OAuth single sign-on for corporate buyers.",
      status: settings.sso_enabled
        ? process.env.SSO_CLIENT_ID || process.env.SSO_AUTH_PROVIDER
          ? "pass"
          : "warn"
        : "manual",
      category: "auth",
      recommendation:
        "Set SSO_AUTH_PROVIDER (Medusa auth id) and/or SSO_CLIENT_ID, SSO_CLIENT_SECRET, and SSO_ISSUER.",
    },
    {
      id: "jwt-secret",
      label: "JWT secret strength",
      description: "Signing key used for store and admin sessions.",
      status: isStrongSecret(process.env.JWT_SECRET) ? "pass" : "fail",
      category: "api",
      recommendation: "Set JWT_SECRET to a random 32+ character value in production.",
    },
    {
      id: "cookie-secret",
      label: "Cookie secret strength",
      description: "Secret used to sign session cookies.",
      status: isStrongSecret(process.env.COOKIE_SECRET) ? "pass" : "fail",
      category: "api",
      recommendation: "Set COOKIE_SECRET to a unique random value.",
    },
    {
      id: "rate-limit",
      label: "API rate limiting",
      description: "Protects auth, registration, and cart endpoints from abuse.",
      status: settings.rate_limit_enabled ? "pass" : "warn",
      category: "api",
      recommendation: "Keep rate limiting enabled; tune RPM limits per environment.",
    },
    {
      id: "pci-tokenization",
      label: "PCI tokenization only",
      description: "Card data never touches Medusa servers (hosted fields / drop-in).",
      status: settings.pci_tokenization_only ? "pass" : "fail",
      category: "payments",
      recommendation:
        "Use Stripe, PayTR, or iyzico hosted fields. Never store PAN/CVV in Postgres.",
    },
    {
      id: "payment-provider",
      label: "Payment provider configured",
      description: "Stripe Payment Element (PCI Level 1). Card data never touches Medusa.",
      status: paymentProviderPostureStatus(),
      category: "payments",
      recommendation: paymentProviderRecommendation(),
    },
    {
      id: "waf",
      label: "Web application firewall",
      description: "Edge protection against XSS, SQLi, and DDoS.",
      status: settings.waf_enabled
        ? settings.waf_provider
          ? "pass"
          : "warn"
        : "manual",
      category: "infrastructure",
      recommendation:
        "Place Cloudflare or AWS WAF in front of storefront and admin URLs.",
    },
    {
      id: "db-ssl",
      label: "Database TLS",
      description: "Encrypted connection between Medusa and PostgreSQL.",
      status: databaseUsesSsl()
        ? "pass"
        : settings.db_ssl_required
          ? "fail"
          : "warn",
      category: "data",
      recommendation:
        "Use sslmode=require (or verify-full) on DATABASE_URL. Production should use a CA-backed Postgres (RDS/Cloud SQL). Local Docker enables TLS with a self-signed cert.",
    },
    {
      id: "field-encryption",
      label: "Sensitive field encryption",
      description: "VAT numbers, phones, and addresses encrypted at rest.",
      status: settings.field_encryption_enabled
        ? process.env.FIELD_ENCRYPTION_KEY
          ? "pass"
          : "warn"
        : "manual",
      category: "data",
      recommendation:
        "Enable field encryption and set FIELD_ENCRYPTION_KEY (32-byte base64).",
    },
    {
      id: "audit-logging",
      label: "Audit logging",
      description: "Immutable trail of admin and B2B actions.",
      status: settings.audit_log_enabled ? "pass" : "warn",
      category: "monitoring",
      recommendation:
        "Keep audit logs enabled and forward to Datadog, CloudWatch, or a SIEM.",
    },
    {
      id: "audit-webhook",
      label: "External log forwarding",
      description: "Push audit events to an external, tamper-resistant store.",
      status: settings.audit_log_external_webhook ? "pass" : "manual",
      category: "monitoring",
      recommendation:
        "Set an audit webhook URL for Datadog, Logtail, or AWS CloudWatch Logs.",
    },
    {
      id: "redis",
      label: "Redis for sessions & cache",
      description: "Shared state for rate limits and session scaling.",
      status: process.env.REDIS_URL ? "pass" : "warn",
      category: "infrastructure",
      recommendation: "Configure REDIS_URL for production deployments.",
    },
  ]

  const summary = {
    pass: checks.filter((check) => check.status === "pass").length,
    warn: checks.filter((check) => check.status === "warn").length,
    fail: checks.filter((check) => check.status === "fail").length,
    manual: checks.filter((check) => check.status === "manual").length,
  }

  const score = Math.round(
    ((summary.pass + summary.manual * 0.5) / checks.length) * 100
  )

  const grade =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F"

  return {
    score,
    grade,
    checks,
    summary,
  }
}
