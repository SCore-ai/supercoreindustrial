import { MedusaContainer } from "@medusajs/framework/types"
import { calculateQuoteOfferTotal } from "./quote-pricing"
import { parseQuoteMetadata, type QuoteAdminStatus } from "./quote-integration"
import { enrichQuoteLineItems } from "./enrich-quote-items"

type QuoteWithItems = {
  id: string
  status: string
  email?: string | null
  customer_id?: string | null
  company_id?: string | null
  company?: string | null
  project?: string | null
  notes?: string | null
  currency_code?: string | null
  valid_until?: string | Date | null
  metadata?: Record<string, unknown> | null
  created_at?: string | Date
  updated_at?: string | Date
  items: Array<Record<string, unknown>>
}

export type StoreQuoteSummary = {
  id: string
  status: string
  admin_status: QuoteAdminStatus | null
  email?: string | null
  company?: string | null
  project?: string | null
  currency_code?: string | null
  valid_until?: string | null
  item_count: number
  offer_total: number | null
  created_at?: string
  updated_at?: string
}

export function toStoreQuoteSummary(
  quote: QuoteWithItems & { item_count?: number }
): StoreQuoteSummary {
  const b2b = parseQuoteMetadata(quote.metadata as Record<string, unknown>)
  const pricedStatuses: QuoteAdminStatus[] = ["quoted", "won"]
  const offerTotal =
    b2b.admin_status && pricedStatuses.includes(b2b.admin_status)
      ? calculateQuoteOfferTotal(quote.items as never)
      : null

  return {
    id: quote.id,
    status: quote.status,
    admin_status: b2b.admin_status ?? null,
    email: quote.email ?? null,
    company: quote.company ?? null,
    project: quote.project ?? null,
    currency_code: quote.currency_code ?? null,
    valid_until: quote.valid_until
      ? new Date(quote.valid_until).toISOString()
      : null,
    item_count: quote.item_count ?? quote.items.length,
    offer_total: offerTotal,
    created_at: quote.created_at
      ? new Date(quote.created_at).toISOString()
      : undefined,
    updated_at: quote.updated_at
      ? new Date(quote.updated_at).toISOString()
      : undefined,
  }
}

export async function enrichStoreQuoteResponse(
  scope: MedusaContainer,
  quote: QuoteWithItems
) {
  const items = await enrichQuoteLineItems(scope, quote.items as never)
  const b2b = parseQuoteMetadata(quote.metadata as Record<string, unknown>)
  const pricedStatuses: QuoteAdminStatus[] = ["quoted", "won"]
  const showPricing =
    b2b.admin_status != null && pricedStatuses.includes(b2b.admin_status)

  return {
    id: quote.id,
    status: quote.status,
    admin_status: b2b.admin_status ?? null,
    order_id: b2b.order_id ?? null,
    email: quote.email ?? null,
    company: quote.company ?? null,
    project: quote.project ?? null,
    notes: quote.notes ?? null,
    currency_code: quote.currency_code ?? null,
    valid_until: quote.valid_until
      ? new Date(quote.valid_until).toISOString()
      : null,
    created_at: quote.created_at
      ? new Date(quote.created_at).toISOString()
      : undefined,
    updated_at: quote.updated_at
      ? new Date(quote.updated_at).toISOString()
      : undefined,
    offer_total: showPricing ? calculateQuoteOfferTotal(items as never) : null,
    items: items.map((item) => ({
      id: item.id,
      variant_id: item.variant_id,
      product_id: item.product_id ?? null,
      quantity: item.quantity,
      sku: item.sku ?? item.variant?.sku ?? null,
      title: item.title ?? item.variant?.product?.title ?? item.variant?.title ?? null,
      thumbnail: item.variant?.product?.thumbnail ?? null,
      unit_price: showPricing
        ? ((item as { unit_price?: number | null }).unit_price ?? null)
        : null,
      discount_percent: showPricing
        ? ((item as { discount_percent?: number | null }).discount_percent ?? 0)
        : null,
      line_total:
        showPricing &&
        (item as { unit_price?: number | null }).unit_price != null
          ? Number(
              (
                (item as { unit_price?: number | null }).unit_price! *
                item.quantity *
                (1 -
                  ((item as { discount_percent?: number | null })
                    .discount_percent ?? 0) /
                    100)
              ).toFixed(2)
            )
          : null,
    })),
  }
}

export function customerCanAccessQuote(
  quote: {
    customer_id?: string | null
    company_id?: string | null
    email?: string | null
    status?: string
  },
  context: {
    customerId: string
    companyId?: string | null
    email?: string | null
  }
) {
  if (quote.status === "draft") {
    return quote.customer_id === context.customerId
  }

  if (quote.customer_id && quote.customer_id === context.customerId) {
    return true
  }

  if (
    context.companyId &&
    quote.company_id &&
    quote.company_id === context.companyId
  ) {
    return true
  }

  if (context.email && quote.email) {
    return quote.email.trim().toLowerCase() === context.email
  }

  return false
}
