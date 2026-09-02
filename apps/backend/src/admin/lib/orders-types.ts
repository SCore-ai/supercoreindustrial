export type AdminOrderSummary = {
  id: string
  display_id: number
  status: string
  email?: string | null
  customer_name?: string | null
  currency_code?: string | null
  total?: number | null
  payment_status?: string | null
  fulfillment_status?: string | null
  created_at?: string | null
  updated_at?: string | null
  is_test_draft?: boolean
  is_archived?: boolean
  b2b_quote_id?: string | null
  item_count?: number
  risk_level?: "low" | "medium" | "high"
  has_customer_notes?: boolean
}

export type AdminOrderStats = {
  total: number
  pending: number
  completed: number
  canceled: number
  requires_action: number
  test_drafts: number
  pending_fulfillment: number
  pending_payment: number
}

export type OrderAddressRecord = {
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  province?: string | null
  postal_code?: string | null
  country_code?: string | null
  phone?: string | null
}

export type AdminOrderLineItem = {
  id: string
  title: string
  subtitle?: string | null
  thumbnail?: string | null
  quantity: number
  unit_price?: number | null
  total?: number | null
  sku?: string | null
}

export type AdminOrderRisk = {
  level: "low" | "medium" | "high"
  score: number
  headline: string
  message: string
  three_ds_authenticated: boolean
}

export type AdminOrderConversion = {
  customer_order_count: number
  order_number_for_customer: number
  first_session_source: string
  session_count: number
  session_days: number
  summary_lines: string[]
}

export type AdminOrderDetail = AdminOrderSummary & {
  customer_id?: string | null
  subtotal?: number | null
  shipping_total?: number | null
  tax_total?: number | null
  discount_total?: number | null
  source?: string | null
  created_at_label?: string | null
  customer_notes?: string | null
  shipping_address?: OrderAddressRecord | null
  billing_address?: OrderAddressRecord | null
  billing_same_as_shipping: boolean
  items: AdminOrderLineItem[]
  risk: AdminOrderRisk
  conversion: AdminOrderConversion
  tags: string[]
}

export type AdminOrdersListResponse = {
  orders: AdminOrderSummary[]
  count: number
  stats: AdminOrderStats
}

export type AdminOrderDetailResponse = {
  order: AdminOrderDetail
}

export type AdminOrderMutationResponse = {
  order: AdminOrderSummary | AdminOrderDetail
}

export type AdminOrderRemoveResponse = {
  id: string
  action: "canceled" | "deleted"
}

export type OrderActionType =
  | "duplicate"
  | "cancel"
  | "archive"
  | "remove_customer"

export type UpdateAdminOrderInput = {
  customer_notes?: string | null
  email?: string | null
  shipping_address?: OrderAddressRecord | null
  billing_address?: OrderAddressRecord | null
  billing_same_as_shipping?: boolean
  tags?: string[]
}
