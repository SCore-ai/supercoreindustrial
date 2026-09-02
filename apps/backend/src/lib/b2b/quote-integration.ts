export type ErpProvider = "zoho_books"

export type ErpSyncStatus =
  | "not_configured"
  | "pending"
  | "synced"
  | "failed"

export type QuoteAdminStatus =
  | "new"
  | "in_review"
  | "quoted"
  | "won"
  | "lost"
  | "cancelled"

export type QuoteErpMetadata = {
  provider?: ErpProvider | null
  sync_status?: ErpSyncStatus
  last_synced_at?: string | null
  quote_request_id?: string | null
  sales_order_id?: string | null
  purchase_order_id?: string | null
  error?: string | null
}

export type QuoteB2bMetadata = {
  admin_status?: QuoteAdminStatus
  archived_admin_status?: QuoteAdminStatus | null
  order_id?: string | null
  admin_notes?: string | null
  erp?: QuoteErpMetadata
}

export const DEFAULT_ERP_METADATA: QuoteErpMetadata = {
  provider: null,
  sync_status: "not_configured",
  last_synced_at: null,
  quote_request_id: null,
  sales_order_id: null,
  purchase_order_id: null,
  error: null,
}

export function parseQuoteMetadata(
  metadata: Record<string, unknown> | null | undefined
): QuoteB2bMetadata {
  if (!metadata || typeof metadata !== "object") {
    return {}
  }

  return metadata as QuoteB2bMetadata
}

export function mergeQuoteMetadata(
  existing: Record<string, unknown> | null | undefined,
  patch: QuoteB2bMetadata
): Record<string, unknown> {
  const current = parseQuoteMetadata(existing)

  return {
    ...(existing ?? {}),
    ...patch,
    erp: {
      ...DEFAULT_ERP_METADATA,
      ...current.erp,
      ...patch.erp,
    },
  }
}

export function mergeErpMetadata(
  existing: Record<string, unknown> | null | undefined,
  patch: QuoteErpMetadata
): Record<string, unknown> {
  return mergeQuoteMetadata(existing, { erp: patch })
}
