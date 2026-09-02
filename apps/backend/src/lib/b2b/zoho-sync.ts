import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"
import adminUpdateQuoteIntegrationWorkflow from "../../workflows/quote/admin-update-quote-integration"
import {
  createZohoEstimate,
  isZohoBooksConfigured,
  ZohoEstimatePayload,
} from "./zoho-books-client"

export async function syncQuoteOfferToZoho(
  scope: MedusaContainer,
  quoteId: string
) {
  const logger = scope.resolve("logger") as {
    info: (msg: string) => void
    warn: (msg: string) => void
    error: (msg: string) => void
  }

  if (!isZohoBooksConfigured()) {
    logger.warn(`[zoho] Skipping sync for quote ${quoteId} — not configured`)
    return { synced: false, reason: "not_configured" }
  }

  const quoteService: QuoteModuleService = scope.resolve(QUOTE_MODULE)
  const quote = await quoteService.retrieveWithItems(quoteId)

  const lineItems = quote.items
    .filter((item) => item.unit_price != null)
    .map((item) => ({
      name: item.title ?? item.sku ?? item.variant_id,
      description: item.mpn ? `MPN: ${item.mpn}` : undefined,
      rate: item.unit_price as number,
      quantity: item.quantity,
      sku: item.sku,
    }))

  if (!lineItems.length) {
    logger.warn(`[zoho] Quote ${quoteId} has no priced lines — skipping`)
    return { synced: false, reason: "no_priced_lines" }
  }

  const payload: ZohoEstimatePayload = {
    customer_name: quote.company ?? quote.email ?? "B2B Customer",
    reference_number: quote.id,
    date: new Date().toISOString().slice(0, 10),
    expiry_date: quote.valid_until
      ? new Date(quote.valid_until).toISOString().slice(0, 10)
      : undefined,
    currency_code: (quote.currency_code ?? "gbp").toUpperCase(),
    line_items: lineItems,
    notes: quote.notes ?? undefined,
  }

  try {
    await adminUpdateQuoteIntegrationWorkflow(scope).run({
      input: {
        quote_id: quoteId,
        erp: {
          provider: "zoho_books",
          sync_status: "pending",
        },
      },
    })

    const result = await createZohoEstimate(payload)

    await adminUpdateQuoteIntegrationWorkflow(scope).run({
      input: {
        quote_id: quoteId,
        erp: {
          provider: "zoho_books",
          sync_status: "synced",
          quote_request_id: result.estimate_id,
          last_synced_at: new Date().toISOString(),
          error: null,
        },
      },
    })

    const eventBus = scope.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "b2b.zoho.synced",
      data: {
        quote_id: quoteId,
        estimate_id: result.estimate_id,
      },
    })

    logger.info(
      `[zoho] Quote ${quoteId} synced as estimate ${result.estimate_id}`
    )

    return { synced: true, estimate_id: result.estimate_id }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    await adminUpdateQuoteIntegrationWorkflow(scope).run({
      input: {
        quote_id: quoteId,
        erp: {
          provider: "zoho_books",
          sync_status: "failed",
          error: message,
        },
      },
    })

    logger.error(`[zoho] Quote ${quoteId} sync failed: ${message}`)
    throw error
  }
}
