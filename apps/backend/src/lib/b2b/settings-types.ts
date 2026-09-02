import { DEFAULT_ADMIN_EMAIL } from "./admin-email"

export const B2B_SETTINGS_ID = "b2b_settings_default"

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
  smtp_pass?: string | null
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
  created_at?: string
  updated_at?: string
}

export type UpdateB2bSettingsInput = Partial<
  Omit<B2bModuleSettings, "id" | "created_at" | "updated_at">
>

export type UpdateB2bSettingsPayload = UpdateB2bSettingsInput & {
  smtp_pass?: string
}

export type B2bStorefrontSettings = {
  features: {
    conversations: boolean
    quotes: boolean
    order_approval: boolean
    tiered_pricing: boolean
    purchase_lists: boolean
    bulk_order_form: boolean
  }
  registration: {
    mode: B2bRegistrationMode
    path: string
    auto_approve: boolean
  }
  storefront: {
    hide_prices_for_guests: boolean
  }
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

export const DEFAULT_B2B_SETTINGS: Omit<
  B2bModuleSettings,
  "id" | "created_at" | "updated_at"
> = {
  conversations_enabled: true,
  quotes_enabled: true,
  order_approval_enabled: true,
  tiered_pricing_enabled: true,
  purchase_lists_enabled: false,
  bulk_order_form_enabled: true,
  registration_mode: "both",
  auto_approve_registrations: false,
  default_require_order_approval: true,
  trade_registration_path: "/register-trade",
  hide_prices_for_guests: false,
  notify_on_registration: true,
  notify_on_quote_submit: true,
  notify_on_offer_sent: true,
  notify_on_order_approval: true,
  zoho_sync_on_offer: true,
  email_enabled: false,
  email_from: DEFAULT_ADMIN_EMAIL,
  email_admin: DEFAULT_ADMIN_EMAIL,
  smtp_host: null,
  smtp_port: 587,
  smtp_user: null,
  smtp_pass: null,
  smtp_secure: false,
  company_legal_name: "SUPERCORE AI SYSTEMS LTD.",
  company_address:
    "140 Goswell Road, Technique Building, Unit 3\nLondon\nEC1V 7DY\nUnited Kingdom",
  company_phone: "+44 203 307 5298",
  company_email: "service@supercoreai.co.uk",
  company_vat_number: "GB454 3803 92",
  company_registration_number: "14447351",
  company_iban: null,
  company_bank: null,
  company_bic: null,
  company_payment_term: "Prepayment",
  metadata: null,
}

export function toStorefrontSettings(
  settings: B2bModuleSettings
): B2bStorefrontSettings {
  return {
    features: {
      conversations: settings.conversations_enabled,
      quotes: settings.quotes_enabled,
      order_approval: settings.order_approval_enabled,
      tiered_pricing: settings.tiered_pricing_enabled,
      purchase_lists: settings.purchase_lists_enabled,
      bulk_order_form: settings.bulk_order_form_enabled,
    },
    registration: {
      mode: settings.registration_mode,
      path: settings.trade_registration_path,
      auto_approve: settings.auto_approve_registrations,
    },
    storefront: {
      hide_prices_for_guests: settings.hide_prices_for_guests,
    },
  }
}
