import { outboundFetch } from "../http/outbound"

export type ZohoBooksConfig = {
  enabled: boolean
  clientId: string
  clientSecret: string
  refreshToken: string
  organizationId: string
  apiBase: string
  accountsBase: string
}

export type ZohoEstimateLineItem = {
  name: string
  description?: string
  rate: number
  quantity: number
  sku?: string | null
}

export type ZohoEstimatePayload = {
  customer_name: string
  reference_number?: string
  date?: string
  expiry_date?: string
  currency_code?: string
  line_items: ZohoEstimateLineItem[]
  notes?: string
}

export function getZohoBooksConfig(): ZohoBooksConfig | null {
  const enabled = process.env.ZOHO_BOOKS_ENABLED === "true"
  const clientId = process.env.ZOHO_BOOKS_CLIENT_ID ?? ""
  const clientSecret = process.env.ZOHO_BOOKS_CLIENT_SECRET ?? ""
  const refreshToken = process.env.ZOHO_BOOKS_REFRESH_TOKEN ?? ""
  const organizationId = process.env.ZOHO_BOOKS_ORGANIZATION_ID ?? ""

  if (!enabled) {
    return null
  }

  if (!clientId || !clientSecret || !refreshToken || !organizationId) {
    return null
  }

  return {
    enabled: true,
    clientId,
    clientSecret,
    refreshToken,
    organizationId,
    apiBase: process.env.ZOHO_BOOKS_API_BASE ?? "https://www.zohoapis.com",
    accountsBase:
      process.env.ZOHO_BOOKS_ACCOUNTS_BASE ?? "https://accounts.zoho.com",
  }
}

export function isZohoBooksConfigured(): boolean {
  return getZohoBooksConfig() !== null
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(config: ZohoBooksConfig): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token
  }

  const params = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
  })

  const response = await outboundFetch(
    `${config.accountsBase}/oauth/v2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    },
    { timeoutMs: 15000, retries: 1 }
  )

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Zoho token refresh failed: ${body}`)
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}

export async function createZohoEstimate(
  payload: ZohoEstimatePayload
): Promise<{ estimate_id: string; raw: Record<string, unknown> }> {
  const config = getZohoBooksConfig()

  if (!config) {
    throw new Error("Zoho Books is not configured")
  }

  const accessToken = await getAccessToken(config)
  const url = `${config.apiBase}/books/v3/estimates?organization_id=${config.organizationId}`

  const response = await outboundFetch(
    url,
    {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    { timeoutMs: 20000, retries: 1 }
  )

  const data = (await response.json()) as {
    code?: number
    message?: string
    estimate?: { estimate_id?: string }
  }

  if (!response.ok || data.code !== 0) {
    throw new Error(data.message ?? `Zoho estimate create failed (${response.status})`)
  }

  const estimateId = data.estimate?.estimate_id

  if (!estimateId) {
    throw new Error("Zoho estimate created but no estimate_id returned")
  }

  return { estimate_id: estimateId, raw: data as Record<string, unknown> }
}
