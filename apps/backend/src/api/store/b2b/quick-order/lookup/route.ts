import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { requireB2bFeature } from "../../../../../lib/b2b/settings-guard"
import { parseBulkOrderRows } from "../../../../../lib/b2b/bulk-order-parser"
import { resolveBulkOrderVariants } from "../../../../../lib/b2b/resolve-bulk-order-variants"

type LookupBody = {
  skus?: string[]
  rows?: Array<{ sku?: string | null; quantity?: number | null }>
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "bulk_order_form_enabled")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Forbidden"
    res.status(403).json({ message })
    return
  }

  const body = (req.body || {}) as LookupBody
  const parsed = parseBulkOrderRows(
    body.rows?.length
      ? body.rows
      : (body.skus ?? []).map((sku) => ({ sku, quantity: 1 }))
  )

  if (!parsed.rows.length) {
    res.json({ items: [], failures: parsed.failures })
    return
  }

  const resolved = await resolveBulkOrderVariants(req.scope, parsed.rows)

  res.json({
    items: resolved.items.map((item) => ({
      sku: item.sku,
      title: item.title,
      variant_id: item.variant_id,
    })),
    failures: [...parsed.failures, ...resolved.failures],
  })
}
