import { MedusaError } from "@medusajs/framework/utils"
import { SECURITY_MODULE } from "../../modules/security"
import SecurityModuleService from "../../modules/security/service"
import { roleHasPermission, type B2bPermission } from "./types"

export async function requireB2bPermission(
  scope: { resolve: (key: string) => unknown },
  role: string | null | undefined,
  permission: B2bPermission
) {
  const securityService = scope.resolve(SECURITY_MODULE) as SecurityModuleService
  const settings = await securityService.getSettings()

  if (!settings.rbac_enforcement_enabled) {
    return
  }

  if (!roleHasPermission(role, permission)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You do not have permission to perform this action."
    )
  }
}

export async function requireAnyB2bPermission(
  scope: { resolve: (key: string) => unknown },
  role: string | null | undefined,
  permissions: B2bPermission[]
) {
  const securityService = scope.resolve(SECURITY_MODULE) as SecurityModuleService
  const settings = await securityService.getSettings()

  if (!settings.rbac_enforcement_enabled) {
    return
  }

  if (permissions.some((permission) => roleHasPermission(role, permission))) {
    return
  }

  throw new MedusaError(
    MedusaError.Types.NOT_ALLOWED,
    "You do not have permission to perform this action."
  )
}

export async function requireMemberPermission(
  scope: { resolve: (key: string) => unknown },
  role: string | null | undefined,
  permission: B2bPermission
) {
  if (!role) {
    return
  }

  await requireB2bPermission(scope, role, permission)
}

export async function requireCompanyScope(
  scope: { resolve: (key: string) => unknown },
  actorCompanyId: string | null | undefined,
  resourceCompanyId: string | null | undefined
) {
  const securityService = scope.resolve(SECURITY_MODULE) as SecurityModuleService
  const settings = await securityService.getSettings()

  if (!settings.company_scope_enforced) {
    return
  }

  if (!actorCompanyId || !resourceCompanyId || actorCompanyId !== resourceCompanyId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cross-company access is not permitted."
    )
  }
}
