export type CompanyStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "archived"

export type B2bCompanyMember = {
  id: string
  company_id: string
  customer_id?: string | null
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  role: "admin" | "buyer" | "approver"
  status: "active" | "invited" | "disabled"
  is_primary: boolean
}

export type B2bCompany = {
  id: string
  name: string
  legal_name?: string | null
  email: string
  phone?: string | null
  vat_number?: string | null
  registration_number?: string | null
  website?: string | null
  country_code?: string | null
  status: CompanyStatus
  customer_group_id?: string | null
  primary_customer_id?: string | null
  approved_at?: string | null
  rejected_at?: string | null
  admin_notes?: string | null
  created_at?: string
  updated_at?: string
  member_count?: number
  members?: B2bCompanyMember[]
}

export type B2bDashboardStats = {
  pending_companies: number
  approved_companies: number
  pending_order_approvals: number
  open_conversations: number
  new_quotes: number
  quoted_offers: number
  in_review_quotes: number
  total_submitted_quotes: number
  won_quotes: number
  lost_quotes: number
}

export type B2bPendingRegistration = {
  id: string
  name: string
  email: string
  legal_name?: string | null
  vat_number?: string | null
  status: CompanyStatus
  created_at?: string
  member_count: number
}

export type B2bOrderApproval = {
  id: string
  order_id: string
  company_id: string
  requested_by_member_id?: string | null
  approved_by_member_id?: string | null
  status: "pending" | "approved" | "rejected"
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type B2bMessage = {
  id: string
  conversation_id: string
  body: string
  sender_type: "admin" | "customer" | "system"
  sender_id?: string | null
  sender_name?: string | null
  created_at?: string
}

export type B2bConversationQuoteLink = {
  id: string | null
  status: "linked" | "removed" | "none"
  label: string
}

export type B2bConversation = {
  id: string
  company_id?: string | null
  quote_id?: string | null
  order_id?: string | null
  subject: string
  status: "open" | "closed" | "archived"
  created_by: "admin" | "customer"
  customer_id?: string | null
  created_at?: string
  updated_at?: string
  messages?: B2bMessage[]
  quote_link?: B2bConversationQuoteLink
}

export type B2bPricingTier = {
  id: string
  name: string
  customer_group_id?: string | null
  variant_id?: string | null
  product_id?: string | null
  min_quantity: number
  max_quantity?: number | null
  unit_price?: number | null
  currency_code: string
  discount_percent: number
  priority: number
  status: "active" | "disabled"
  created_at?: string
  updated_at?: string
}

export type PricingTierInput = {
  name: string
  customer_group_id?: string | null
  variant_id?: string | null
  product_id?: string | null
  min_quantity?: number
  max_quantity?: number | null
  unit_price?: number | null
  currency_code?: string
  discount_percent?: number
  priority?: number
  status?: "active" | "disabled"
}

export type OrderApprovalsListResponse = {
  approvals: B2bOrderApproval[]
  count: number
  limit: number
  offset: number
}

export type ConversationsListResponse = {
  conversations: B2bConversation[]
  count: number
  limit: number
  offset: number
}

export type PricingTiersListResponse = {
  tiers: B2bPricingTier[]
  count: number
  limit: number
  offset: number
}

export type QuoteAdminStatus =
  | "new"
  | "in_review"
  | "quoted"
  | "won"
  | "lost"
  | "cancelled"

export type ErpSyncStatus =
  | "not_configured"
  | "pending"
  | "synced"
  | "failed"

export type QuoteErpMetadata = {
  provider?: "zoho_books" | null
  sync_status?: ErpSyncStatus
  last_synced_at?: string | null
  quote_request_id?: string | null
  sales_order_id?: string | null
  purchase_order_id?: string | null
  error?: string | null
}

export type QuoteB2bMetadata = {
  admin_status?: QuoteAdminStatus
  order_id?: string | null
  admin_notes?: string | null
  erp?: QuoteErpMetadata
}

export type AdminQuoteListItem = {
  id: string
  status: "draft" | "submitted"
  email?: string | null
  company?: string | null
  project?: string | null
  region_id?: string | null
  created_at?: string
  updated_at?: string
  item_count: number
  b2b?: QuoteB2bMetadata
}

export type AdminQuoteLineItem = {
  id: string
  variant_id: string
  product_id?: string | null
  quantity: number
  sku?: string | null
  mpn?: string | null
  title?: string | null
  unit_price?: number | null
  discount_percent?: number | null
  variant?: {
    id: string
    sku?: string | null
    title?: string | null
    product?: {
      id: string
      title?: string | null
      thumbnail?: string | null
    } | null
  } | null
}

export type AdminQuote = {
  id: string
  status: "draft" | "submitted"
  email?: string | null
  company?: string | null
  project?: string | null
  notes?: string | null
  region_id?: string | null
  customer_id?: string | null
  company_id?: string | null
  currency_code?: string | null
  valid_until?: string | null
  created_at?: string
  updated_at?: string
  items: AdminQuoteLineItem[]
  company?: B2bCompany | null
  offer_total?: number | null
  b2b?: QuoteB2bMetadata
}

export type AdminQuotesListResponse = {
  quotes: AdminQuoteListItem[]
  count: number
  limit: number
  offset: number
}

export type AdminQuoteResponse = {
  quote: AdminQuote
}

export type AdminCompaniesListResponse = {
  companies: B2bCompany[]
  count: number
  limit: number
  offset: number
}

export type AdminCompanyResponse = {
  company: B2bCompany
}

export type AdminCustomerGroup = {
  id: string
  name: string
  customer_count: number
  companies: number
  pricing_rules: number
  created_at?: string | null
}

export type AdminCustomerGroupsListResponse = {
  groups: AdminCustomerGroup[]
  unassigned_companies: number
  global_pricing_rules: number
}

export type AdminDashboardResponse = {
  stats: B2bDashboardStats
  pending_registrations: B2bPendingRegistration[]
  pending_order_approvals: B2bOrderApproval[]
}

export type B2bRegistrationMode = "quote_submit" | "dedicated_form" | "both"

export type B2bModuleSettings = {
  id: string
  conversations_enabled: boolean
  quotes_enabled: boolean
  order_approval_enabled: boolean
  tiered_pricing_enabled: boolean
  purchase_lists_enabled: boolean
  bulk_order_form_enabled: boolean
  registration_mode: B2bRegistrationMode
  auto_approve_registrations: boolean
  default_require_order_approval: boolean
  trade_registration_path: string
  hide_prices_for_guests: boolean
  notify_on_registration: boolean
  notify_on_quote_submit: boolean
  notify_on_offer_sent: boolean
  notify_on_order_approval: boolean
  zoho_sync_on_offer: boolean
  email_enabled: boolean
  email_from: string | null
  email_admin: string | null
  smtp_host: string | null
  smtp_port: number
  smtp_user: string | null
  smtp_secure: boolean
  company_legal_name: string | null
  company_address: string | null
  company_phone: string | null
  company_email: string | null
  company_vat_number: string | null
  company_registration_number: string | null
  company_iban: string | null
  company_bank: string | null
  company_bic: string | null
  company_payment_term: string | null
  metadata?: Record<string, unknown> | null
  updated_at?: string
}

export type B2bZohoSettingsStatus = {
  enabled: boolean
  configured: boolean
  sync_on_offer: boolean
  missing_env: string[]
}

export type B2bEmailSettingsStatus = {
  enabled: boolean
  configured: boolean
  smtp_pass_set: boolean
  missing_fields: string[]
}

export type B2bEmailTestResult = {
  success: boolean
  stage: "config" | "verify" | "send"
  message: string
  error?: string
  hint?: string
  config?: {
    host: string
    port: number
    secure: boolean
    require_tls: boolean
    from: string
    auth_configured: boolean
  }
}

export type AdminB2bSettingsResponse = {
  settings: B2bModuleSettings
  zoho: B2bZohoSettingsStatus
  email: B2bEmailSettingsStatus
}

export type UpdateB2bSettingsInput = Partial<
  Omit<B2bModuleSettings, "id" | "created_at" | "updated_at">
> & {
  smtp_pass?: string
}
