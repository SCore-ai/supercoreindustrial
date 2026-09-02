import type { QuoteAdminStatus, QuoteB2bMetadata } from "./quote-integration"

export const ARCHIVED_QUOTE_ADMIN_STATUS: QuoteAdminStatus = "cancelled"

export const COMPANY_RESTORE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const

export type CompanyRestoreStatus = (typeof COMPANY_RESTORE_STATUSES)[number]

export const CONVERSATION_RESTORE_STATUSES = ["open", "closed"] as const

export type ConversationRestoreStatus =
  (typeof CONVERSATION_RESTORE_STATUSES)[number]

type ConversationRestoreInput = {
  status?: string | null
  metadata?: Record<string, unknown> | null
}

export function isConversationArchived(status?: string | null) {
  return status === "archived"
}

export function resolveConversationRestoreStatus(
  conversation: ConversationRestoreInput
): ConversationRestoreStatus {
  const metadata = (conversation.metadata ?? {}) as Record<string, unknown>
  const stored = metadata.archived_from_status

  if (
    typeof stored === "string" &&
    CONVERSATION_RESTORE_STATUSES.includes(stored as ConversationRestoreStatus)
  ) {
    return stored as ConversationRestoreStatus
  }

  return "closed"
}

export function buildArchivedConversationMetadata(
  existing: Record<string, unknown> | null | undefined,
  currentStatus: string
) {
  return {
    ...(existing ?? {}),
    archived_from_status: currentStatus,
    archived_at: new Date().toISOString(),
  }
}

export function buildRestoredConversationMetadata(
  existing: Record<string, unknown> | null | undefined
) {
  const metadata = { ...(existing ?? {}) }
  delete metadata.archived_from_status
  delete metadata.archived_at
  return metadata
}

type CompanyRestoreInput = {
  approved_at?: Date | string | null
  rejected_at?: Date | string | null
  metadata?: Record<string, unknown> | null
}

export function isQuoteArchived(
  b2b?: Pick<QuoteB2bMetadata, "admin_status"> | null
) {
  return b2b?.admin_status === ARCHIVED_QUOTE_ADMIN_STATUS
}

export function resolveCompanyRestoreStatus(
  company: CompanyRestoreInput
): CompanyRestoreStatus {
  const metadata = (company.metadata ?? {}) as Record<string, unknown>
  const stored = metadata.archived_from_status

  if (
    typeof stored === "string" &&
    COMPANY_RESTORE_STATUSES.includes(stored as CompanyRestoreStatus)
  ) {
    return stored as CompanyRestoreStatus
  }

  if (company.approved_at) {
    return "approved"
  }

  if (company.rejected_at) {
    return "rejected"
  }

  return "pending"
}

export function buildArchivedCompanyMetadata(
  existing: Record<string, unknown> | null | undefined,
  currentStatus: string
) {
  return {
    ...(existing ?? {}),
    archived_from_status: currentStatus,
  }
}

export function buildRestoredCompanyMetadata(
  existing: Record<string, unknown> | null | undefined
) {
  const metadata = { ...(existing ?? {}) }
  delete metadata.archived_from_status
  return metadata
}
