import type { SecurityModuleSettings } from "./types"

export type StoreAuthOptions = {
  storefront_mfa_required: boolean
  sso_enabled: boolean
  sso_provider: SecurityModuleSettings["sso_provider"]
  sso_auth_provider: string | null
  sso_authorize_url: string | null
}

function storefrontUrl() {
  return (process.env.STOREFRONT_URL?.trim() || "http://localhost:8000").replace(
    /\/$/,
    ""
  )
}

function ssoRedirectUri() {
  return (
    process.env.SSO_REDIRECT_URI?.trim() ||
    `${storefrontUrl()}/account/sso/callback`
  )
}

export function buildSsoAuthorizeUrl() {
  const explicit = process.env.SSO_AUTHORIZE_URL?.trim()
  if (explicit) {
    return explicit
  }

  const issuer = process.env.SSO_ISSUER?.trim()
  const clientId = process.env.SSO_CLIENT_ID?.trim()

  if (!issuer || !clientId) {
    return null
  }

  const base = issuer.replace(/\/$/, "")
  const authorize = /\/authorize$/i.test(base) ? base : `${base}/authorize`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: ssoRedirectUri(),
    response_type: "code",
    scope: process.env.SSO_SCOPES?.trim() || "openid email profile",
  })

  return `${authorize}?${params.toString()}`
}

export function toStoreAuthOptions(
  settings: SecurityModuleSettings
): StoreAuthOptions {
  const ssoAuthProvider = process.env.SSO_AUTH_PROVIDER?.trim() || null

  return {
    storefront_mfa_required: settings.storefront_mfa_required,
    sso_enabled: settings.sso_enabled,
    sso_provider: settings.sso_provider,
    sso_auth_provider: ssoAuthProvider,
    sso_authorize_url: settings.sso_enabled ? buildSsoAuthorizeUrl() : null,
  }
}
