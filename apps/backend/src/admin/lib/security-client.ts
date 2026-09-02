import type {
  SecurityModuleSettings,
  SecurityPostureReport,
  B2bRolePermissions,
} from "./security-types"

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const body = await response.text()
    let message = body || `Request failed (${response.status})`
    try {
      const parsed = JSON.parse(body) as { message?: string }
      if (parsed?.message) {
        message = parsed.message
      }
    } catch {
      // keep raw body
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export const securityClient = {
  getSecurity() {
    return adminFetch<{
      settings: SecurityModuleSettings
      posture: SecurityPostureReport
    }>("/admin/system/security")
  },

  updateSecurity(body: Partial<SecurityModuleSettings>) {
    return adminFetch<{
      settings: SecurityModuleSettings
      posture: SecurityPostureReport
    }>("/admin/system/security", {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  listAuditLogs(params?: {
    action?: string
    company_id?: string
    resource_type?: string
    limit?: number
    offset?: number
  }) {
    const search = new URLSearchParams()

    if (params?.action) search.set("action", params.action)
    if (params?.company_id) search.set("company_id", params.company_id)
    if (params?.resource_type) search.set("resource_type", params.resource_type)
    if (params?.limit !== undefined) search.set("limit", String(params.limit))
    if (params?.offset !== undefined) search.set("offset", String(params.offset))

    const query = search.toString()
    const path = query
      ? `/admin/system/security/audit-logs?${query}`
      : "/admin/system/security/audit-logs"

    return adminFetch<{
      logs: Array<Record<string, unknown>>
      count: number
      limit: number
      offset: number
    }>(path)
  },

  getAdminMfaStatus() {
    return adminFetch<{
      required: boolean
      enforced: boolean
      verified: boolean
      email: string | null
      bypass: boolean
    }>("/admin/system/mfa/status")
  },

  challengeAdminMfa() {
    return adminFetch<{
      required: boolean
      email?: string
      message?: string
    }>("/admin/system/mfa/challenge", {
      method: "POST",
      body: "{}",
    })
  },

  verifyAdminMfa(code: string) {
    return adminFetch<{
      verified: boolean
      required: boolean
    }>("/admin/system/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  },

  getStripeStatus() {
    return adminFetch<{
      configured: boolean
      live_mode: boolean
      live_blocked: boolean
      capture: boolean
      automatic_payment_methods: boolean
      auto_enable_regions: boolean
      provider_id: string
      provider_registered: boolean
      secret_key_masked: string | null
      publishable_key_configured: boolean
      webhook_configured: boolean
      webhook_url: string
      webhook_events: string[]
      mode_mismatch: boolean
      warnings: string[]
      regions: Array<{
        id: string
        name: string
        currency_code: string
        enabled: boolean
        payment_providers: string[]
      }>
    }>("/admin/system/payments/stripe")
  },

  enableStripeRegions() {
    return adminFetch<{
      updated: number
      regions: Array<{
        id: string
        name: string
        currency_code: string
        enabled: boolean
        payment_providers: string[]
      }>
    }>("/admin/system/payments/stripe/regions", {
      method: "POST",
      body: "{}",
    })
  },
}

export type { SecurityModuleSettings, SecurityPostureReport, B2bRolePermissions }
