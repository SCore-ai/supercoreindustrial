import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { enrichQuoteLineItems } from "../enrich-quote-items"
import { calculateLineTotal } from "../quote-pricing"
import { B2B_MODULE } from "../../../modules/b2b"
import B2bModuleService from "../../../modules/b2b/service"
import { QUOTE_MODULE } from "../../../modules/quote"
import QuoteModuleService from "../../../modules/quote/service"

export type QuoteEmailLineItem = {
  title: string
  sku: string | null
  quantity: number
  unit_price: number | null
  line_total: number | null
  thumbnail: string | null
}

export type QuoteEmailPayload = {
  quote_id: string
  email: string | null
  company: string | null
  project: string | null
  notes: string | null
  currency_code: string
  created_at: string | null
  items: QuoteEmailLineItem[]
  item_count: number
  subtotal: number | null
}

function asMoneyAmount(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null
  }

  return value
}

export async function loadQuoteEmailPayload(
  scope: MedusaContainer,
  quoteId: string
): Promise<QuoteEmailPayload | null> {
  const quoteService = scope.resolve(QUOTE_MODULE) as QuoteModuleService

  try {
    const quote = await quoteService.retrieveWithItems(quoteId)
    const enriched = await enrichQuoteLineItems(scope, quote.items as never)

    const items: QuoteEmailLineItem[] = enriched.map((item) => {
      const unitPrice = asMoneyAmount(
        (item as { unit_price?: number | null }).unit_price
      )
      const lineTotal = calculateLineTotal(item as never)
      const title =
        item.title ??
        item.variant?.product?.title ??
        item.variant?.title ??
        "Product"
      const sku = item.sku ?? item.variant?.sku ?? null

      return {
        title,
        sku,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        thumbnail: item.variant?.product?.thumbnail ?? null,
      }
    })

    const priced = items.filter((item) => item.line_total != null)
    const subtotal =
      priced.length === items.length && items.length > 0
        ? Number(
            priced
              .reduce((sum, item) => sum + (item.line_total ?? 0), 0)
              .toFixed(2)
          )
        : null

    return {
      quote_id: quote.id,
      email: quote.email ?? null,
      company: quote.company ?? null,
      project: quote.project ?? null,
      notes: quote.notes ?? null,
      currency_code: (quote.currency_code ?? "gbp").toLowerCase(),
      created_at: quote.created_at
        ? new Date(quote.created_at).toISOString()
        : null,
      items,
      item_count: items.length,
      subtotal,
    }
  } catch {
    return null
  }
}

export async function resolveConversationCustomerEmail(
  scope: MedusaContainer,
  conversation: {
    quote_id?: string | null
    company_id?: string | null
    customer_id?: string | null
  }
): Promise<string | null> {
  if (conversation.quote_id) {
    const quoteService = scope.resolve(QUOTE_MODULE) as QuoteModuleService

    try {
      const quote = await quoteService.retrieveQuote(conversation.quote_id)
      if (quote.email?.trim()) {
        return quote.email.trim()
      }
    } catch {
      // fall through
    }
  }

  if (conversation.company_id) {
    try {
      const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
      const company = await b2bService.retrieveB2bCompany(conversation.company_id)
      if (company.email?.trim()) {
        return company.email.trim()
      }
    } catch {
      // fall through
    }
  }

  if (conversation.customer_id) {
    try {
      const customerModule = scope.resolve(Modules.CUSTOMER) as {
        retrieveCustomer: (
          id: string
        ) => Promise<{ email?: string | null }>
      }
      const customer = await customerModule.retrieveCustomer(
        conversation.customer_id
      )
      if (customer.email?.trim()) {
        return customer.email.trim()
      }
    } catch {
      // fall through
    }
  }

  return null
}
