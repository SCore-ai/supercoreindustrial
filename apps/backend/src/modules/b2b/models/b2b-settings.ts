import { model } from "@medusajs/framework/utils"

const B2bSettings = model.define("b2b_settings", {
  id: model.id().primaryKey(),
  conversations_enabled: model.boolean().default(true),
  quotes_enabled: model.boolean().default(true),
  order_approval_enabled: model.boolean().default(true),
  tiered_pricing_enabled: model.boolean().default(true),
  purchase_lists_enabled: model.boolean().default(false),
  bulk_order_form_enabled: model.boolean().default(true),
  registration_mode: model
    .enum(["quote_submit", "dedicated_form", "both"])
    .default("both"),
  auto_approve_registrations: model.boolean().default(false),
  default_require_order_approval: model.boolean().default(true),
  trade_registration_path: model.text().default("/register-trade"),
  hide_prices_for_guests: model.boolean().default(false),
  notify_on_registration: model.boolean().default(true),
  notify_on_quote_submit: model.boolean().default(true),
  notify_on_offer_sent: model.boolean().default(true),
  notify_on_order_approval: model.boolean().default(true),
  zoho_sync_on_offer: model.boolean().default(true),
  email_enabled: model.boolean().default(false),
  email_from: model.text().nullable(),
  email_admin: model.text().nullable(),
  smtp_host: model.text().nullable(),
  smtp_port: model.number().default(587),
  smtp_user: model.text().nullable(),
  smtp_pass: model.text().nullable(),
  smtp_secure: model.boolean().default(false),
  company_legal_name: model.text().nullable(),
  company_address: model.text().nullable(),
  company_phone: model.text().nullable(),
  company_email: model.text().nullable(),
  company_vat_number: model.text().nullable(),
  company_registration_number: model.text().nullable(),
  company_iban: model.text().nullable(),
  company_bank: model.text().nullable(),
  company_bic: model.text().nullable(),
  company_payment_term: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default B2bSettings
