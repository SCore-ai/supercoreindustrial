import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import { parseBulkOrderInput } from "../../../../../lib/b2b/bulk-order-parser"
import { requireB2bFeature } from "../../../../../lib/b2b/settings-guard"
import { resolveBulkOrderVariants } from "../../../../../lib/b2b/resolve-bulk-order-variants"

type AddToCartBody = {
  cart_id: string
  rows?: Array<{ sku?: string | null; quantity?: number | null }>
  csv?: string | null
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "bulk_order_form_enabled")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const body = (req.body || {}) as AddToCartBody

  if (!body.cart_id) {
    res.status(400).json({ message: "cart_id is required" })
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

  if (!resolved.items.length) {
    res.status(400).json({
      message: "No matching SKUs found",
      parse_failures: parsed.failures,
      resolution_failures: resolved.failures,
    })
    return
  }

  for (const item of resolved.items) {
    await addToCartWorkflow(req.scope).run({
      input: {
        cart_id: body.cart_id,
        items: [
          {
            variant_id: item.variant_id,
            quantity: item.quantity,
            metadata: {
              quick_order: true,
              sku: item.sku,
            },
          },
        ],
      },
    })
  }

  res.status(201).json({
    added_count: resolved.items.length,
    parse_failures: parsed.failures,
    resolution_failures: resolved.failures,
  })
}
