import { existsSync, readFileSync } from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { inferManufacturerId } from "../lib/catalog/category-mapping"
import { resolveProductsRoot } from "../lib/catalog/catalog-handle-lookup"
import { resolveProductHandle } from "../lib/catalog/catalog-permalink"

/**
 * Finish handle remaps left on tmp-rehandle-* after an interrupted sync.
 *
 *   medusa exec ./src/scripts/finish-original-product-handles.ts
 */

const MANUFACTURERS = ["axis", "spectrum", "tecnovideo", "zenitel"] as const

function skuKey(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

function loadIndexLookup() {
  const bySku = new Map<string, string>()
  const indexPath = path.join(resolveProductsRoot(), "_index.json")
  if (!existsSync(indexPath)) {
    return bySku
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    products?: Array<{
      slug?: string
      sku?: string | null
      manufacturer?: string | null
      title?: string | null
    }>
  }
  for (const row of index.products || []) {
    const manufacturerId = String(row.manufacturer || "").toLowerCase()
    if (!MANUFACTURERS.includes(manufacturerId as (typeof MANUFACTURERS)[number])) {
      continue
    }
    const handle = resolveProductHandle({
      manufacturerId,
      sku: row.sku,
      catalogSlug: row.slug,
      title: row.title,
    })
    const sku = skuKey(row.sku)
    if (sku) {
      bySku.set(`${manufacturerId}:${sku}`, handle)
    }
  }
  return bySku
}

export default async function finishOriginalProductHandles({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const bySku = loadIndexLookup()

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata", "variants.sku", "variants.metadata"],
    filters: { handle: { $like: "tmp-rehandle-%" } },
    pagination: { take: 1000 },
  })

  logger.info(`[handle-finish] leftover=${products.length}`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const product of products as Array<{
    id: string
    handle: string
    metadata?: Record<string, unknown> | null
    variants?: Array<{
      sku?: string | null
      metadata?: Record<string, unknown> | null
    }> | null
  }>) {
    const manufacturerId = inferManufacturerId({
      handle: product.handle,
      manufacturerId:
        typeof product.metadata?.manufacturer_id === "string"
          ? product.metadata.manufacturer_id
          : null,
      manufacturer:
        typeof product.metadata?.manufacturer === "string"
          ? product.metadata.manufacturer
          : null,
    })
    const variantSku = product.variants?.find((variant) => variant.sku)?.sku
    const parentSku = product.variants?.find(
      (variant) => variant.metadata?.parent_sku
    )?.metadata?.parent_sku
    const mpn =
      typeof product.metadata?.mpn === "string" ? product.metadata.mpn : null
    const nextHandle =
      (manufacturerId && variantSku
        ? bySku.get(`${manufacturerId}:${skuKey(variantSku)}`)
        : undefined) ||
      (manufacturerId && parentSku
        ? bySku.get(`${manufacturerId}:${skuKey(String(parentSku))}`)
        : undefined) ||
      (manufacturerId && mpn
        ? bySku.get(`${manufacturerId}:${skuKey(mpn)}`)
        : undefined)

    if (!nextHandle) {
      skipped += 1
      logger.warn(`[handle-finish] no slug for ${product.id} ${product.handle}`)
      continue
    }

    try {
      await productModule.updateProducts(product.id, { handle: nextHandle })
      updated += 1
      if (updated % 50 === 0) {
        logger.info(`[handle-finish] ${updated}/${products.length}`)
      }
    } catch (error: unknown) {
      failed += 1
      logger.error(
        `[handle-finish] ${product.handle} -> ${nextHandle}: ${
          error instanceof Error ? error.message : error
        }`
      )
    }
  }

  logger.info(
    `[handle-finish] done updated=${updated} skipped=${skipped} failed=${failed}`
  )
}
