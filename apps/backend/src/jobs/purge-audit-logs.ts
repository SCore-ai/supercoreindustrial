import type { MedusaContainer } from "@medusajs/framework/types"
import { SECURITY_MODULE } from "../modules/security"
import SecurityModuleService from "../modules/security/service"

export default async function purgeAuditLogsJob(container: MedusaContainer) {
  const logger = container.resolve("logger")
  const securityService = container.resolve(SECURITY_MODULE) as SecurityModuleService
  const deleted = await securityService.purgeExpiredAuditLogs()

  if (deleted > 0) {
    logger.info(`[security] purged ${deleted} expired audit log(s)`)
  }
}

export const config = {
  name: "purge-audit-logs",
  schedule: "15 2 * * *",
}
