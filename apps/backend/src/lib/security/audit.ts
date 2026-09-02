import type { MedusaContainer } from "@medusajs/framework/types"
import { SECURITY_MODULE } from "../../modules/security"
import SecurityModuleService from "../../modules/security/service"
import type { CreateAuditLogInput } from "./types"

export async function writeAuditLog(
  scope: MedusaContainer,
  input: CreateAuditLogInput
) {
  const securityService = scope.resolve(SECURITY_MODULE) as SecurityModuleService
  const settings = await securityService.getSettings()

  if (!settings.audit_log_enabled) {
    return null
  }

  return securityService.createAuditLogEntry(input)
}

export async function auditFromRequest(
  req: {
    scope: MedusaContainer
    ip?: string
    headers?: Record<string, string | string[] | undefined>
    auth_context?: { actor_type?: string; actor_id?: string }
  },
  input: Omit<CreateAuditLogInput, "ip_address" | "user_agent" | "actor_id" | "actor_type"> &
    Partial<Pick<CreateAuditLogInput, "actor_type" | "actor_id">>
) {
  const context = getRequestAuditContext(req)
  return writeAuditLog(req.scope, {
    ...context,
    ...input,
    actor_type: input.actor_type ?? context.actor_type,
    actor_id: input.actor_id ?? context.actor_id,
  })
}

export function getRequestAuditContext(req: {
  ip?: string
  headers?: Record<string, string | string[] | undefined>
  auth_context?: { actor_type?: string; actor_id?: string }
}) {
  const userAgent = req.headers?.["user-agent"]
  const actorType = req.auth_context?.actor_type

  return {
    ip_address: req.ip ?? null,
    user_agent: Array.isArray(userAgent) ? userAgent[0] : userAgent ?? null,
    actor_id: req.auth_context?.actor_id ?? null,
    actor_type:
      actorType === "user"
        ? "admin"
        : actorType === "customer"
          ? "customer"
          : "system",
  }
}
