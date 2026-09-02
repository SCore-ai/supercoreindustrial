import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { parseBulkOrderInput } from "../../../../../lib/b2b/bulk-order-parser"
import { requireB2bFeature } from "../../../../../lib/b2b/settings-guard"
import { resolveBulkOrderVariants } from "../../../../../lib/b2b/resolve-bulk-order-variants"
import { QUOTE_MODULE } from "../../../../../modules/quote"
import QuoteModuleService from "../../../../../modules/quote/service"
import { bulkAddQuoteLineItemsWorkflow } from "../../../../../workflows/quote/bulk-add-quote-line-items"

type BulkLineItemsBody = {
  rows?: Array<{ sku?: string | null; quantity?: number | null }>
  csv?: string | null
  dry_run?: boolean
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "quotes_enabled")
    await requireB2bFeature(req.scope, "bulk_order_form_enabled")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const { id: quoteId } = req.params
  const body = (req.body || {}) as BulkLineItemsBody
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)

  try {
    await quoteService.retrieveQuote(quoteId)
  } catch {
    res.status(404).json({ message: "Quote not found" })
    return
  }

  const parsed = parseBulkOrderInput({
    rows: body.rows,
    csv: body.csv,
  })

  if (!parsed.rows.length) {
    res.status(400).json({
      message: "No valid rows to import",
      parse_failures: parsed.failures,
    })
    return
  }

  const resolved = await resolveBulkOrderVariants(req.scope, parsed.rows)

  if (body.dry_run) {
    res.json({
      dry_run: true,
      resolved: resolved.items,
      parse_failures: parsed.failures,
      resolution_failures: resolved.failures,
    })
    return
  }

  if (!resolved.items.length) {
    res.status(400).json({
      message: "No matching SKUs found",
      parse_failures: parsed.failures,
      resolution_failures: resolved.failures,
    })
    return
  }

  const { result: lineItems } = await bulkAddQuoteLineItemsWorkflow(
    req.scope
  ).run({
    input: {
      quote_id: quoteId,
      items: resolved.items.map((item) => ({
        quote_id: quoteId,
        variant_id: item.variant_id,
        product_id: item.product_id ?? null,
        quantity: item.quantity,
        sku: item.sku,
        mpn: item.mpn ?? null,
        title: item.title ?? null,
        metadata: {
          bulk_order: true,
          source_line: item.line,
        },
      })),
    },
  })

  const productModule = req.scope.resolve(Modules.PRODUCT)

  for (const item of resolved.items) {
    await productModule
      .retrieveProductVariant(item.variant_id)
      .catch(() => null)
  }

  const quote = await quoteService.retrieveWithItems(quoteId)

  res.status(201).json({
    quote,
    line_items: lineItems,
    added_count: lineItems.length,
    parse_failures: parsed.failures,
    resolution_failures: resolved.failures,
  })
}
