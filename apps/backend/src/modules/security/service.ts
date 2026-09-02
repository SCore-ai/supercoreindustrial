import { MedusaService } from "@medusajs/framework/utils"
import { outboundFetch } from "../../lib/http/outbound"
import AuditLog from "./models/audit-log"
import SecuritySettings from "./models/security-settings"
import {
  DEFAULT_SECURITY_SETTINGS,
  SECURITY_SETTINGS_ID,
  type CreateAuditLogInput,
  type SecurityModuleSettings,
  type UpdateSecuritySettingsInput,
} from "../../lib/security/types"

export type ListAuditLogsInput = {
  action?: string
  company_id?: string
  resource_type?: string
  limit?: number
  offset?: number
}

class SecurityModuleService extends MedusaService({
  SecuritySettings,
  AuditLog,
}) {
  async ensureDefaultSettings(): Promise<SecurityModuleSettings> {
    const [existing] = await this.listSecuritySettings(
      { id: SECURITY_SETTINGS_ID },
      { take: 1 }
    )

    if (existing) {
      const metadata = (existing.metadata ?? {}) as Record<string, unknown>

      if (metadata.admin_mfa_v1 !== true) {
        await this.updateSecuritySettings({
          id: SECURITY_SETTINGS_ID,
          admin_mfa_required: true,
          metadata: {
            ...metadata,
            admin_mfa_v1: true,
          },
        })

        return this.retrieveSecuritySettings(
          SECURITY_SETTINGS_ID
        ) as Promise<SecurityModuleSettings>
      }

      return existing as SecurityModuleSettings
    }

    const [created] = await this.createSecuritySettings([
      {
        id: SECURITY_SETTINGS_ID,
        ...DEFAULT_SECURITY_SETTINGS,
        metadata: { admin_mfa_v1: true },
      },
    ])

    return created as SecurityModuleSettings
  }

  async getSettings(): Promise<SecurityModuleSettings> {
    return this.ensureDefaultSettings()
  }

  async updateSettings(
    input: UpdateSecuritySettingsInput
  ): Promise<SecurityModuleSettings> {
    await this.ensureDefaultSettings()

    await this.updateSecuritySettings({
      id: SECURITY_SETTINGS_ID,
      ...input,
    })

    return this.retrieveSecuritySettings(
      SECURITY_SETTINGS_ID
    ) as Promise<SecurityModuleSettings>
  }

  async createAuditLogEntry(input: CreateAuditLogInput) {
    const [entry] = await this.createAuditLogs([
      {
        actor_type: input.actor_type ?? "system",
        actor_id: input.actor_id ?? null,
        actor_email: input.actor_email ?? null,
        action: input.action,
        resource_type: input.resource_type,
        resource_id: input.resource_id ?? null,
        company_id: input.company_id ?? null,
        ip_address: input.ip_address ?? null,
        user_agent: input.user_agent ?? null,
        summary: input.summary ?? null,
        metadata: input.metadata ?? null,
      },
    ])

    await this.forwardAuditLogIfConfigured(entry)

    return entry
  }

  private async forwardAuditLogIfConfigured(entry: Record<string, unknown>) {
    const settings = await this.getSettings()
    const webhook = settings.audit_log_external_webhook?.trim()

    if (!webhook) {
      return
    }

    try {
      await outboundFetch(
        webhook,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "supercore-medusa-b2b",
            event: "audit_log.created",
            payload: entry,
          }),
        },
        { timeoutMs: 5000, retries: 0 }
      )
    } catch {
      // External forwarding must never break the primary request path.
    }
  }

  async listAuditLogsForAdmin(input: ListAuditLogsInput = {}) {
    const filters: Record<string, unknown> = {}

    if (input.action) {
      filters.action = input.action
    }

    if (input.company_id) {
      filters.company_id = input.company_id
    }

    if (input.resource_type) {
      filters.resource_type = input.resource_type
    }

    const [logs, count] = await this.listAndCountAuditLogs(filters, {
      take: input.limit ?? 25,
      skip: input.offset ?? 0,
      order: { created_at: "DESC" },
    })

    return { logs, count }
  }

  async purgeExpiredAuditLogs() {
    const settings = await this.getSettings()
    const retentionDays = Math.max(1, settings.audit_log_retention_days)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - retentionDays)

    const [expired] = await this.listAndCountAuditLogs(
      { created_at: { $lt: cutoff } },
      { take: 500, skip: 0 }
    )

    if (expired.length) {
      await this.deleteAuditLogs(expired.map((entry) => entry.id))
    }

    return expired.length
  }
}

export default SecurityModuleService
