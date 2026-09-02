import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type QuoteLineItemRecord = {
  id: string
  variant_id: string
  product_id?: string | null
  quantity: number
  sku?: string | null
  mpn?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
}

type InventoryLevel = {
  stocked_quantity?: number | null
  reserved_quantity?: number | null
}

type EnrichedVariant = {
  id: string
  sku?: string | null
  title?: string | null
  weight?: number | null
  length?: number | null
  width?: number | null
  height?: number | null
  manage_inventory?: boolean | null
  metadata?: Record<string, unknown> | null
  inventory_items?: Array<{
    location_levels?: InventoryLevel[] | null
  }> | null
  product?: {
    id: string
    title?: string | null
    thumbnail?: string | null
    hs_code?: string | null
    mid_code?: string | null
    origin_country?: string | null
    weight?: number | null
    length?: number | null
    width?: number | null
    height?: number | null
    metadata?: Record<string, unknown> | null
  } | null
}

export type EnrichedQuoteLineItem = QuoteLineItemRecord & {
  variant?: EnrichedVariant | null
}

export async function enrichQuoteLineItems(
  scope: MedusaContainer,
  items: QuoteLineItemRecord[]
): Promise<EnrichedQuoteLineItem[]> {
  const variantIds = [
    ...new Set(items.map((item) => item.variant_id).filter(Boolean)),
  ]

  if (!variantIds.length) {
    return items
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "title",
      "weight",
      "length",
      "width",
      "height",
      "manage_inventory",
      "metadata",
      "inventory_items.location_levels.stocked_quantity",
      "inventory_items.location_levels.reserved_quantity",
      "product.id",
      "product.title",
      "product.thumbnail",
      "product.hs_code",
      "product.mid_code",
      "product.origin_country",
      "product.weight",
      "product.length",
      "product.width",
      "product.height",
      "product.metadata",
    ],
    filters: {
      id: variantIds,
    },
  })

  const variantMap = new Map(
    (variants as EnrichedVariant[]).map((variant) => [variant.id, variant])
  )

  return items.map((item) => ({
    ...item,
    variant: variantMap.get(item.variant_id) ?? null,
  }))
}
