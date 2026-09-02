export type AbandonedCheckoutRecoveryStatus = "not_recovered" | "recovered"

export type AbandonedCheckoutRecoveryEmailStatus =
  | "not_sent"
  | "sent"
  | "failed"

export type AbandonedCheckoutRecoveryEmail = {
  status: AbandonedCheckoutRecoveryEmailStatus
  sent_at?: string | null
  sent_to?: string | null
  last_error?: string | null
}

export type AbandonedCheckoutMetadata = {
  admin_notes?: string | null
  recovery_status?: AbandonedCheckoutRecoveryStatus
  recovered_order_id?: string | null
  recovery_email?: AbandonedCheckoutRecoveryEmail
}

export type AbandonedCheckoutAddress = {
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  postal_code?: string | null
  province?: string | null
  country_code?: string | null
  phone?: string | null
}

export type AbandonedCheckoutLineItem = {
  id: string
  title?: string | null
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price: number
  sku?: string | null
  product_handle?: string | null
  line_total: number
}

export type AbandonedCheckoutSummary = {
  id: string
  display_id: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email?: string | null
  region_label: string
  country_code?: string | null
  recovery_status: AbandonedCheckoutRecoveryStatus
  recovery_email_status: AbandonedCheckoutRecoveryEmailStatus
  currency_code: string
  total: number
  item_count: number
}

export type AbandonedCheckoutDetail = AbandonedCheckoutSummary & {
  checkout_url: string
  email?: string | null
  customer_id?: string | null
  has_account: boolean
  admin_notes?: string | null
  recovered_order_id?: string | null
  recovery_email_status: AbandonedCheckoutRecoveryEmailStatus
  recovery_email_sent_at?: string | null
  recovery_email_sent_to?: string | null
  recovery_email_error?: string | null
  email_configured: boolean
  shipping_method?: string | null
  shipping_address?: AbandonedCheckoutAddress | null
  billing_address?: AbandonedCheckoutAddress | null
  billing_same_as_shipping: boolean
  items: AbandonedCheckoutLineItem[]
  item_subtotal: number
  shipping_subtotal: number
  tax_total: number
  discount_subtotal: number
  total: number
}

export type ListAbandonedCheckoutsInput = {
  recovery_status?: AbandonedCheckoutRecoveryStatus | "all"
  q?: string
  limit?: number
  offset?: number
}
