import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShieldCheck } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Tabs,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { SettingsToggleRow } from "../../../components/b2b/settings-toggle-row"
import { AuditLogTable } from "../../../components/security/audit-log-table"
import { RbacMatrix } from "../../../components/security/rbac-matrix"
import { StripeSettingsPanel } from "../../../components/security/stripe-settings-panel"
import {
  SecurityCheckRow,
  SecurityPostureHero,
} from "../../../components/security/security-posture"
import { securityClient } from "../../../lib/security-client"
import type { SecurityModuleSettings } from "../../../lib/security-types"

const CATEGORY_LABELS: Record<string, string> = {
  rbac: "RBAC & company access",
  auth: "Authentication",
  api: "API security",
  payments: "PCI & payments",
  infrastructure: "Infrastructure & WAF",
  data: "Data protection",
  monitoring: "Audit & monitoring",
}

const SystemSecurityPage = () => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Partial<SecurityModuleSettings>>({})
  const [auditOffset, setAuditOffset] = useState(0)
  const auditLimit = 20

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-system-security"],
    queryFn: () => securityClient.getSecurity(),
  })

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["admin-system-security-audit", auditOffset],
    queryFn: () =>
      securityClient.listAuditLogs({ limit: auditLimit, offset: auditOffset }),
  })

  const settings = useMemo(() => {
    return { ...(data?.settings ?? {}), ...draft } as SecurityModuleSettings
  }, [data?.settings, draft])

  const saveMutation = useMutation({
    mutationFn: () => securityClient.updateSecurity(draft),
    onSuccess: (response) => {
      queryClient.setQueryData(["admin-system-security"], response)
      setDraft({})
      toast.success("Security settings saved")
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const updateDraft = <K extends keyof SecurityModuleSettings>(
    key: K,
    value: SecurityModuleSettings[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const checksByCategory = useMemo(() => {
    const grouped = new Map<string, typeof data.posture.checks>()

    for (const check of data?.posture.checks ?? []) {
      const list = grouped.get(check.category) ?? []
      list.push(check)
      grouped.set(check.category, list)
    }

    return grouped
  }, [data?.posture.checks])

  if (isLoading) {
    return (
      <Container>
        <Text>Loading security center...</Text>
      </Container>
    )
  }

  if (error || !data) {
    return (
      <Container>
        <Text className="text-ui-fg-error">
          {(error as Error)?.message ?? "Failed to load security settings"}
        </Text>
      </Container>
    )
  }

  const hasChanges = Object.keys(draft).length > 0
  const auditCount = auditData?.count ?? 0
  const auditPage = Math.floor(auditOffset / auditLimit) + 1
  const auditPageCount = Math.max(1, Math.ceil(auditCount / auditLimit))

  return (
    <Container className="flex flex-col gap-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Heading level="h1">Security</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            B2B security posture, access control, compliance controls, and audit
            trail — Shopify/BigCommerce-grade hosted SaaS protections adapted
            for self-hosted Medusa.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/system/extensions"
            className="text-sm text-ui-fg-interactive hover:underline"
          >
            Extensions
          </Link>
          {hasChanges && (
            <Button
              size="small"
              isLoading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              Save changes
            </Button>
          )}
        </div>
      </div>

      <SecurityPostureHero
        score={data.posture.score}
        grade={data.posture.grade}
        summary={data.posture.summary}
      />

      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="rbac">RBAC & access</Tabs.Trigger>
          <Tabs.Trigger value="auth">Authentication</Tabs.Trigger>
          <Tabs.Trigger value="api">API & rate limits</Tabs.Trigger>
          <Tabs.Trigger value="payments">PCI & payments</Tabs.Trigger>
          <Tabs.Trigger value="infrastructure">Infrastructure</Tabs.Trigger>
          <Tabs.Trigger value="audit">Audit logs</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="mt-4 space-y-4">
          {Array.from(checksByCategory.entries()).map(([category, checks]) => (
            <div
              key={category}
              className="rounded-lg border border-ui-border-base p-4"
            >
              <Heading level="h2" className="mb-3 text-base">
                {CATEGORY_LABELS[category] ?? category}
              </Heading>
              {checks.map((check) => (
                <SecurityCheckRow key={check.id} check={check} />
              ))}
            </div>
          ))}
        </Tabs.Content>

        <Tabs.Content value="rbac" className="mt-4 space-y-4">
          <div className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h2" className="mb-2 text-base">
              B2B role permissions
            </Heading>
            <Text size="small" className="mb-4 text-ui-fg-subtle">
              Each company member (buyer, approver, admin) is scoped to their
              company. Permissions are enforced on store B2B API routes when RBAC
              enforcement is enabled.
            </Text>
            <RbacMatrix />
          </div>

          <div className="rounded-lg border border-ui-border-base p-4">
            <SettingsToggleRow
              label="RBAC enforcement"
              description="Block B2B store actions when the member role lacks permission."
              checked={settings.rbac_enforcement_enabled}
              onChange={(value) =>
                updateDraft("rbac_enforcement_enabled", value)
              }
            />
            <SettingsToggleRow
              label="Company scope isolation"
              description="Prevent cross-company access to quotes, orders, and approvals."
              checked={settings.company_scope_enforced}
              onChange={(value) => updateDraft("company_scope_enforced", value)}
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="auth" className="mt-4 space-y-4">
          <div className="rounded-lg border border-ui-border-base p-4">
            <SettingsToggleRow
              label="Require admin MFA"
              description="After password login, admin users must enter a 6-digit email code. Uses B2B SMTP settings."
              checked={settings.admin_mfa_required}
              onChange={(value) => updateDraft("admin_mfa_required", value)}
            />
            <SettingsToggleRow
              label="Require B2B storefront MFA"
              description="After password login, trade accounts must enter an email one-time code."
              checked={settings.storefront_mfa_required}
              onChange={(value) =>
                updateDraft("storefront_mfa_required", value)
              }
            />
            <SettingsToggleRow
              label="Enterprise SSO"
              description="Show SSO on the storefront login. Configure SSO_AUTH_PROVIDER and/or SSO_CLIENT_ID + SSO_ISSUER."
              checked={settings.sso_enabled}
              onChange={(value) => updateDraft("sso_enabled", value)}
            />

            {settings.sso_enabled && (
              <div className="mt-4 max-w-sm">
                <Label>SSO provider</Label>
                <Select
                  value={settings.sso_provider ?? "oauth"}
                  onValueChange={(value) =>
                    updateDraft(
                      "sso_provider",
                      value as SecurityModuleSettings["sso_provider"]
                    )
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Provider" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="saml">SAML 2.0</Select.Item>
                    <Select.Item value="oauth">OAuth 2.0</Select.Item>
                    <Select.Item value="oidc">OpenID Connect</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            )}

            <Text size="xsmall" className="mt-4 text-ui-fg-subtle">
              Storefront MFA emails a 6-digit code (B2B email must be configured).
              Admin MFA uses the same SMTP sender and the admin user&apos;s
              account email. Emergency bypass: ADMIN_MFA_BYPASS=true.
              SSO uses Medusa&apos;s customer auth provider (SSO_AUTH_PROVIDER)
              and/or SSO_ISSUER + SSO_CLIENT_ID.
            </Text>
          </div>
        </Tabs.Content>

        <Tabs.Content value="api" className="mt-4 space-y-4">
          <div className="rounded-lg border border-ui-border-base p-4">
            <SettingsToggleRow
              label="Rate limiting"
              description="Throttle auth, registration, cart, and customer endpoints."
              checked={settings.rate_limit_enabled}
              onChange={(value) => updateDraft("rate_limit_enabled", value)}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="store_rpm">Store API limit (req/min)</Label>
                <Input
                  id="store_rpm"
                  type="number"
                  min={10}
                  value={settings.rate_limit_store_rpm}
                  onChange={(event) =>
                    updateDraft(
                      "rate_limit_store_rpm",
                      Number(event.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="auth_rpm">Auth endpoints (req/min)</Label>
                <Input
                  id="auth_rpm"
                  type="number"
                  min={5}
                  value={settings.rate_limit_auth_rpm}
                  onChange={(event) =>
                    updateDraft(
                      "rate_limit_auth_rpm",
                      Number(event.target.value)
                    )
                  }
                />
              </div>
            </div>

            <Text size="xsmall" className="mt-4 text-ui-fg-subtle">
              Protected routes: /store/auth*, /store/b2b/register, /store/carts*,
              /store/customers/me*. Complement with Cloudflare rate rules at the
              edge for DDoS protection.
            </Text>
          </div>
        </Tabs.Content>

        <Tabs.Content value="payments" className="mt-4 space-y-4">
          <div className="rounded-lg border border-ui-border-base p-4">
            <SettingsToggleRow
              label="PCI tokenization only"
              description="Never capture card numbers on Medusa servers — use hosted fields only."
              checked={settings.pci_tokenization_only}
              onChange={(value) => updateDraft("pci_tokenization_only", value)}
            />

            <div className="mt-4 space-y-3 rounded-md bg-ui-bg-subtle p-4">
              <Text size="small" weight="plus">
                Card data never touches Medusa
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                Stripe Payment Element tokenizes cards in Stripe.js (PCI SAQ A).
                Secret keys stay in STRIPE_API_KEY. Do not paste sk_ keys into
                this dashboard. Full setup lives under System → Payments.
              </Text>
            </div>
            <StripeSettingsPanel />
            <Text size="xsmall" className="mt-3">
              <Link
                to="/system/payments"
                className="text-ui-fg-interactive hover:underline"
              >
                Open Payments setup
              </Link>
            </Text>
          </div>
        </Tabs.Content>

        <Tabs.Content value="infrastructure" className="mt-4 space-y-4">
          <div className="rounded-lg border border-ui-border-base p-4">
            <SettingsToggleRow
              label="Require database TLS"
              description="Fail posture checks unless DATABASE_URL uses sslmode=require or verify-full."
              checked={settings.db_ssl_required}
              onChange={(value) => updateDraft("db_ssl_required", value)}
            />
            <SettingsToggleRow
              label="Encrypt sensitive fields at rest"
              description="AES-256 encryption for VAT, phone, and address fields in Postgres."
              checked={settings.field_encryption_enabled}
              onChange={(value) => updateDraft("field_encryption_enabled", value)}
              planned
            />
            <SettingsToggleRow
              label="WAF enabled"
              description="Cloudflare or AWS WAF sits in front of storefront and admin."
              checked={settings.waf_enabled}
              onChange={(value) => updateDraft("waf_enabled", value)}
            />

            {settings.waf_enabled && (
              <div className="mt-4 max-w-sm">
                <Label>WAF provider</Label>
                <Select
                  value={settings.waf_provider ?? "cloudflare"}
                  onValueChange={(value) =>
                    updateDraft(
                      "waf_provider",
                      value as SecurityModuleSettings["waf_provider"]
                    )
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Provider" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="cloudflare">Cloudflare</Select.Item>
                    <Select.Item value="aws">AWS WAF</Select.Item>
                    <Select.Item value="other">Other</Select.Item>
                  </Select.Content>
                </Select>
              </div>
            )}

            <Text size="xsmall" className="mt-4 text-ui-fg-subtle">
              SSL/TLS certificates are terminated at your reverse proxy or CDN.
              Enable automatic HTTPS redirects and HSTS for production domains.
            </Text>
          </div>
        </Tabs.Content>

        <Tabs.Content value="audit" className="mt-4 space-y-4">
          <div className="rounded-lg border border-ui-border-base p-4">
            <SettingsToggleRow
              label="Audit logging"
              description="Record admin and B2B actions with actor, IP, and resource."
              checked={settings.audit_log_enabled}
              onChange={(value) => updateDraft("audit_log_enabled", value)}
            />

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="retention">Retention (days)</Label>
                <Input
                  id="retention"
                  type="number"
                  min={7}
                  value={settings.audit_log_retention_days}
                  onChange={(event) =>
                    updateDraft(
                      "audit_log_retention_days",
                      Number(event.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="webhook">External webhook URL</Label>
                <Input
                  id="webhook"
                  placeholder="https://http-intake.logs.datadoghq.com/..."
                  value={settings.audit_log_external_webhook ?? ""}
                  onChange={(event) =>
                    updateDraft(
                      "audit_log_external_webhook",
                      event.target.value || null
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-ui-border-base p-4">
            <Heading level="h2" className="mb-3 text-base">
              Recent audit events
            </Heading>
            {auditLoading && <Text size="small">Loading audit logs...</Text>}
            {!auditLoading && (
              <>
                <AuditLogTable logs={auditData?.logs ?? []} />
                <div className="mt-4 flex items-center justify-between">
                  <Text size="small" className="text-ui-fg-subtle">
                    {auditCount} total events
                  </Text>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-ui-fg-interactive disabled:text-ui-fg-disabled"
                      disabled={auditOffset === 0}
                      onClick={() =>
                        setAuditOffset(Math.max(0, auditOffset - auditLimit))
                      }
                    >
                      Previous
                    </button>
                    <Text size="small">
                      Page {auditPage} of {auditPageCount}
                    </Text>
                    <button
                      type="button"
                      className="text-ui-fg-interactive disabled:text-ui-fg-disabled"
                      disabled={auditOffset + auditLimit >= auditCount}
                      onClick={() => setAuditOffset(auditOffset + auditLimit)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Security",
  icon: ShieldCheck,
})

export default SystemSecurityPage
