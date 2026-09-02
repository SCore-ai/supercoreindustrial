import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import {
  mergeErpMetadata,
  mergeQuoteMetadata,
  parseQuoteMetadata,
  QuoteAdminStatus,
  QuoteErpMetadata,
} from "../../lib/b2b/quote-integration"
import {
  ARCHIVED_QUOTE_ADMIN_STATUS,
  isQuoteArchived,
} from "../../lib/b2b/record-lifecycle"
import {
  calculateQuoteOfferTotal,
  QuoteLinePricingInput,
} from "../../lib/b2b/quote-pricing"
import Quote from "./models/quote"
import QuoteLineItem from "./models/quote-line-item"

export type AddQuoteLineItemInput = {
  quote_id: string
  variant_id: string
  product_id?: string | null
  quantity: number
  sku?: string | null
  mpn?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
}

export type SubmitQuoteInput = {
  email: string
  company?: string | null
  project?: string | null
  notes?: string | null
  customer_id?: string | null
}

export type AdminListQuotesInput = {
  status?: "draft" | "submitted"
  include_archived?: boolean
  archived_only?: boolean
  limit?: number
  offset?: number
}

export type AdminUpdateQuoteInput = {
  id: string
  status?: "draft" | "submitted"
  admin_status?: QuoteAdminStatus
  order_id?: string | null
  admin_notes?: string | null
  company_id?: string | null
  currency_code?: string | null
  valid_until?: Date | string | null
}

export type AdminSendQuoteOfferInput = {
  quote_id: string
  currency_code?: string | null
  valid_until?: Date | string | null
  line_items?: QuoteLinePricingInput[]
  admin_notes?: string | null
}

class QuoteModuleService extends MedusaService({
  Quote,
  QuoteLineItem,
}) {
  async retrieveWithItems(quoteId: string) {
    const quote = await this.retrieveQuote(quoteId)
    const items = await this.listQuoteLineItems({
      quote_id: quoteId,
    })

    return { ...quote, items }
  }

  async addOrUpdateLineItem(input: AddQuoteLineItemInput) {
    const [existing] = await this.listQuoteLineItems({
      quote_id: input.quote_id,
      variant_id: input.variant_id,
    })

    if (existing) {
      const updated = await this.updateQuoteLineItems({
        id: existing.id,
        quantity: existing.quantity + input.quantity,
      })
      return updated
    }

    const [created] = await this.createQuoteLineItems([input])
    return created
  }

  async submitQuote(
    quoteId: string,
    input: SubmitQuoteInput,
    companyId?: string | null
  ) {
    const existing = await this.retrieveQuote(quoteId)
    const metadata = mergeQuoteMetadata(existing.metadata as Record<string, unknown>, {
      admin_status: "new",
    })

    const quote = await this.updateQuotes({
      id: quoteId,
      status: "submitted",
      email: input.email,
      company: input.company ?? null,
      project: input.project ?? null,
      notes: input.notes ?? null,
      customer_id: input.customer_id ?? null,
      company_id: companyId ?? existing.company_id ?? null,
      metadata,
    })

    const items = await this.listQuoteLineItems({ quote_id: quoteId })
    return { ...quote, items }
  }

  async linkCompanyToQuote(quoteId: string, companyId: string) {
    await this.updateQuotes({
      id: quoteId,
      company_id: companyId,
    })

    return this.retrieveWithItems(quoteId)
  }

  async listQuotesForAdmin(input: AdminListQuotesInput = {}) {
    const filters: Record<string, unknown> = {}

    if (input.status) {
      filters.status = input.status
    }

    const limit = input.limit ?? 20
    const offset = input.offset ?? 0

    const [allQuotes] = await this.listAndCountQuotes(filters, {
      take: 10000,
      skip: 0,
      order: { created_at: "DESC" },
    })

    const filteredQuotes = allQuotes.filter((quote) => {
      const b2b = parseQuoteMetadata(
        quote.metadata as Record<string, unknown>
      )
      const archived = isQuoteArchived(b2b)

      if (input.archived_only) {
        return archived
      }

      if (!input.include_archived) {
        return !archived
      }

      return true
    })

    const count = filteredQuotes.length
    const quotes = filteredQuotes.slice(offset, offset + limit)

    const quoteIds = quotes.map((quote) => quote.id)
    const lineItems = quoteIds.length
      ? await this.listQuoteLineItems({ quote_id: quoteIds })
      : []

    const itemCountByQuote = new Map<string, number>()

    for (const item of lineItems) {
      itemCountByQuote.set(
        item.quote_id,
        (itemCountByQuote.get(item.quote_id) ?? 0) + 1
      )
    }

    return {
      quotes: quotes.map((quote) => ({
        ...quote,
        item_count: itemCountByQuote.get(quote.id) ?? 0,
        b2b: parseQuoteMetadata(quote.metadata as Record<string, unknown>),
      })),
      count,
    }
  }

  async adminUpdateQuote(input: AdminUpdateQuoteInput) {
    const existing = await this.retrieveQuote(input.id)
    const metadata = mergeQuoteMetadata(existing.metadata as Record<string, unknown>, {
      ...(input.admin_status !== undefined && {
        admin_status: input.admin_status,
      }),
      ...(input.order_id !== undefined && { order_id: input.order_id }),
      ...(input.admin_notes !== undefined && {
        admin_notes: input.admin_notes,
      }),
    })

    const quote = await this.updateQuotes({
      id: input.id,
      ...(input.status && { status: input.status }),
      ...(input.company_id !== undefined && { company_id: input.company_id }),
      ...(input.currency_code !== undefined && {
        currency_code: input.currency_code,
      }),
      ...(input.valid_until !== undefined && {
        valid_until: input.valid_until,
      }),
      metadata,
    })

    return this.retrieveWithItems(quote.id)
  }

  async adminArchiveQuote(quoteId: string) {
    const existing = await this.retrieveQuote(quoteId)
    const b2b = parseQuoteMetadata(existing.metadata as Record<string, unknown>)
    const currentStatus = b2b.admin_status ?? "new"

    if (currentStatus === ARCHIVED_QUOTE_ADMIN_STATUS) {
      return this.retrieveWithItems(quoteId)
    }

    const metadata = mergeQuoteMetadata(
      existing.metadata as Record<string, unknown>,
      {
        archived_admin_status: currentStatus,
        admin_status: ARCHIVED_QUOTE_ADMIN_STATUS,
      }
    )

    await this.updateQuotes({
      id: quoteId,
      metadata,
    })

    return this.retrieveWithItems(quoteId)
  }

  async adminRestoreQuote(quoteId: string) {
    const existing = await this.retrieveQuote(quoteId)
    const b2b = parseQuoteMetadata(existing.metadata as Record<string, unknown>)

    if (!isQuoteArchived(b2b)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Offer is not archived"
      )
    }

    const restoreStatus = b2b.archived_admin_status ?? "new"
    const metadata = mergeQuoteMetadata(
      existing.metadata as Record<string, unknown>,
      {
        admin_status: restoreStatus,
        archived_admin_status: null,
      }
    )

    delete metadata.archived_admin_status

    await this.updateQuotes({
      id: quoteId,
      metadata,
    })

    return this.retrieveWithItems(quoteId)
  }

  async adminDeleteQuote(quoteId: string) {
    const items = await this.listQuoteLineItems({ quote_id: quoteId })

    if (items.length) {
      await this.deleteQuoteLineItems(items.map((item) => item.id))
    }

    await this.deleteQuotes(quoteId)
  }

  async adminUpdateQuoteIntegration(quoteId: string, erp: QuoteErpMetadata) {
    const existing = await this.retrieveQuote(quoteId)
    const metadata = mergeErpMetadata(
      existing.metadata as Record<string, unknown>,
      erp
    )

    await this.updateQuotes({
      id: quoteId,
      metadata,
    })

    return this.retrieveWithItems(quoteId)
  }

  async listQuotesForCustomer(input: {
    customer_id: string
    email?: string | null
    company_id?: string | null
    limit?: number
    offset?: number
  }) {
    const limit = input.limit ?? 20
    const offset = input.offset ?? 0

    const [submittedQuotes] = await this.listAndCountQuotes(
      { status: "submitted" },
      {
        take: 200,
        skip: 0,
        order: { created_at: "DESC" },
      }
    )

    const normalizedEmail = input.email?.trim().toLowerCase()
    const matched = submittedQuotes.filter((quote) => {
      if (quote.customer_id === input.customer_id) {
        return true
      }

      if (
        input.company_id &&
        quote.company_id &&
        quote.company_id === input.company_id
      ) {
        return true
      }

      if (
        normalizedEmail &&
        quote.email?.trim().toLowerCase() === normalizedEmail
      ) {
        return true
      }

      return false
    })

    const page = matched.slice(offset, offset + limit)
    const quoteIds = page.map((quote) => quote.id)
    const lineItems = quoteIds.length
      ? await this.listQuoteLineItems({ quote_id: quoteIds })
      : []

    const itemCountByQuote = new Map<string, number>()

    for (const item of lineItems) {
      itemCountByQuote.set(
        item.quote_id,
        (itemCountByQuote.get(item.quote_id) ?? 0) + 1
      )
    }

    return {
      quotes: page.map((quote) => ({
        ...quote,
        items: lineItems.filter((item) => item.quote_id === quote.id),
        item_count: itemCountByQuote.get(quote.id) ?? 0,
      })),
      count: matched.length,
      limit,
      offset,
    }
  }

  async findQuoteByOrderId(orderId: string) {
    const quotes = await this.listQuotes(
      {},
      {
        take: 200,
        order: { created_at: "DESC" },
      }
    )

    const match = quotes.find((quote) => {
      const b2b = parseQuoteMetadata(quote.metadata as Record<string, unknown>)
      return b2b.order_id === orderId
    })

    if (!match) {
      return null
    }

    return this.retrieveWithItems(match.id)
  }

  async adminSendQuoteOffer(input: AdminSendQuoteOfferInput) {
    if (input.line_items?.length) {
      for (const line of input.line_items) {
        await this.updateQuoteLineItems({
          id: line.id,
          ...(line.unit_price !== undefined && {
            unit_price: line.unit_price,
          }),
          ...(line.discount_percent !== undefined && {
            discount_percent: line.discount_percent,
          }),
        })
      }
    }

    const existing = await this.retrieveQuote(input.quote_id)
    const metadata = mergeQuoteMetadata(
      existing.metadata as Record<string, unknown>,
      {
        admin_status: "quoted",
        ...(input.admin_notes !== undefined && {
          admin_notes: input.admin_notes,
        }),
        erp: {
          sync_status: "pending",
        },
      }
    )

    await this.updateQuotes({
      id: input.quote_id,
      ...(input.currency_code !== undefined && {
        currency_code: input.currency_code,
      }),
      ...(input.valid_until !== undefined && {
        valid_until: input.valid_until,
      }),
      metadata,
    })

    const quote = await this.retrieveWithItems(input.quote_id)
    const offer_total = calculateQuoteOfferTotal(quote.items)

    return {
      ...quote,
      offer_total,
      b2b: parseQuoteMetadata(quote.metadata as Record<string, unknown>),
    }
  }
}

export default QuoteModuleService
