import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { BulkOrderRow } from "./bulk-order-parser"

type VariantRecord = {
  id: string
  sku?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
  product?: {
    id?: string
    title?: string
  } | null
}

export type ResolvedBulkOrderItem = {
  sku: string
  quantity: number
  line: number
  variant_id: string
  product_id?: string | null
  title?: string | null
  mpn?: string | null
}

export type BulkOrderResolutionFailure = {
  sku: string
  quantity: number
  line: number
  reason: string
}

export type BulkOrderResolutionResult = {
  items: ResolvedBulkOrderItem[]
  failures: BulkOrderResolutionFailure[]
}

function buildVariantTitle(variant: VariantRecord) {
  const product = variant.product
  if (product?.title) {
    return `${product.title} — ${variant.title || variant.sku}`
  }

  return (variant.title as string | undefined) ?? variant.sku ?? null
}

export async function resolveBulkOrderVariants(
  scope: { resolve: (key: string) => unknown },
  rows: BulkOrderRow[]
): Promise<BulkOrderResolutionResult> {
  if (!rows.length) {
    return { items: [], failures: [] }
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const uniqueSkus = Array.from(
    new Set(rows.map((row) => row.sku.trim()).filter(Boolean))
  )

  const variantsBySku = new Map<string, VariantRecord[]>()
  const chunkSize = 100

  for (let offset = 0; offset < uniqueSkus.length; offset += chunkSize) {
    const chunk = uniqueSkus.slice(offset, offset + chunkSize)

    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "title",
        "metadata",
        "product.id",
        "product.title",
      ],
      filters: { sku: { $in: chunk } } as Record<string, unknown>,
    })

    for (const variant of variants as VariantRecord[]) {
      const sku = String(variant.sku ?? "").trim()
      if (!sku) {
        continue
      }

      const key = sku.toLowerCase()
      const bucket = variantsBySku.get(key) ?? []
      bucket.push(variant)
      variantsBySku.set(key, bucket)
    }
  }

  const items: ResolvedBulkOrderItem[] = []
  const failures: BulkOrderResolutionFailure[] = []

  for (const row of rows) {
    const matches = variantsBySku.get(row.sku.toLowerCase()) ?? []

    if (!matches.length) {
      failures.push({
        sku: row.sku,
        quantity: row.quantity,
        line: row.line,
        reason: "SKU not found",
      })
      continue
    }

    const variant = matches[0]
    const metadata = (variant.metadata || {}) as Record<string, unknown>

    items.push({
      sku: row.sku,
      quantity: row.quantity,
      line: row.line,
      variant_id: variant.id,
      product_id: variant.product?.id ?? null,
      title: buildVariantTitle(variant),
      mpn: (metadata.mpn as string) ?? null,
    })

    if (matches.length > 1) {
      failures.push({
        sku: row.sku,
        quantity: row.quantity,
        line: row.line,
        reason: "Multiple variants share this SKU; first match used",
      })
    }
  }

  return { items, failures }
}
