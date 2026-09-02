import { createHmac, timingSafeEqual } from "crypto"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { SECURITY_MODULE } from "../../modules/security"
import SecurityModuleService from "../../modules/security/service"
import { getEmailRuntimeConfig } from "../b2b/settings-email"
import { resolveAdminMfaEmail } from "../b2b/admin-email"
import { getCookieSigningSecret } from "./secrets"

export const ADMIN_MFA_COOKIE = "_medusa_admin_mfa"
export const ADMIN_MFA_MAX_AGE_SECONDS = 60 * 60 * 12

export function maskEmail(email: string) {
  const normalized = email.trim().toLowerCase()
  const at = normalized.indexOf("@")

  if (at <= 1) {
    return normalized
  }

  return `${normalized[0]}***${normalized.slice(at)}`
}

export function readCookieHeader(
  cookieHeader: string | string[] | undefined,
  name: string
) {
  const raw = Array.isArray(cookieHeader) ? cookieHeader.join("; ") : cookieHeader

  if (!raw) {
    return undefined
  }

  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) {
      return rest.join("=")
    }
  }

  return undefined
}

export function signAdminMfaToken(userId: string) {
  const expiresAt = Date.now() + ADMIN_MFA_MAX_AGE_SECONDS * 1000
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: expiresAt }),
    "utf8"
  ).toString("base64url")
  const signature = createHmac("sha256", getCookieSigningSecret())
    .update(payload)
    .digest("hex")

  return `${payload}.${signature}`
}

export function verifyAdminMfaToken(token: string | undefined, userId: string) {
  if (!token || !userId) {
    return false
  }

  const separator = token.lastIndexOf(".")

  if (separator <= 0 || separator === token.length - 1) {
    return false
  }

  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = createHmac("sha256", getCookieSigningSecret())
    .update(payload)
    .digest("hex")

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return false
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { sub?: string; exp?: number }

    return parsed.sub === userId && Number(parsed.exp) > Date.now()
  } catch {
    return false
  }
}

export function requireAdminActorId(req: {
  auth_context?: { actor_type?: string; actor_id?: string }
}) {
  const authContext = req.auth_context

  if (!authContext || authContext.actor_type !== "user" || !authContext.actor_id) {
    return null
  }

  return authContext.actor_id
}

export function buildAdminMfaCookie(userId: string) {
  const token = signAdminMfaToken(userId)
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""

  return `${ADMIN_MFA_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_MFA_MAX_AGE_SECONDS}${secure}`
}

export async function getAdminUserEmail(
  scope: MedusaContainer,
  userId: string
): Promise<string | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ email?: string | null }> }>
  }

  const { data } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: { id: userId },
  })

  return data[0]?.email?.trim().toLowerCase() ?? null
}

export async function getAdminMfaDestinationEmail(
  scope: MedusaContainer,
  userId: string
): Promise<string> {
  const userEmail = await getAdminUserEmail(scope, userId)
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const settings = await b2bService.getSettings()
  const config = getEmailRuntimeConfig(settings)

  return resolveAdminMfaEmail({
    userEmail,
    adminEmail: config.admin,
    envEmail: process.env.ADMIN_MFA_EMAIL,
  })
}

export async function isAdminEmailReady(scope: MedusaContainer) {
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  const settings = await b2bService.getSettings()
  return getEmailRuntimeConfig(settings).enabled
}

export async function isAdminMfaEnforced(scope: MedusaContainer) {
  if (process.env.ADMIN_MFA_BYPASS === "true") {
    return false
  }

  const securityService = scope.resolve(SECURITY_MODULE) as SecurityModuleService
  const settings = await securityService.getSettings()

  if (!settings.admin_mfa_required) {
    return false
  }

  return isAdminEmailReady(scope)
}

export function isAdminMfaExemptPath(path: string) {
  const normalized = path.split("?")[0] || path

  return (
    normalized.startsWith("/admin/system/mfa") ||
    normalized === "/admin/users/me" ||
    normalized.startsWith("/admin/users/me/")
  )
}
