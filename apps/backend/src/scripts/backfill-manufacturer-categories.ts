import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import {
  inferManufacturerId,
  mapManufacturerCategory,
} from "../lib/catalog/category-mapping"
import { isLegacyMedusaProduct } from "../lib/catalog/legacy-devices"
import {
  buildCategoryHandleIndex,
  loadWebsiteCategoryIndex,
  medusaCategoryHandle,
  resolveWebsiteCategoryHandle,
} from "../lib/catalog/medusa-category-assignment"
import { syncSupercoreCategoryTree } from "../migration-scripts/sync-category-tree"

type Args = {
  container: MedusaContainer
  args?: string[]
}

function parseFlag(args: string[] | undefined, name: string): string | null {
  const all = [...(args ?? []), ...process.argv.slice(2)]
  const prefix = `--${name}=`
  const hit = all.find((a) => a.startsWith(prefix))
  return hit ? hit.slice(prefix.length) : null
}

function hasFlag(args: string[] | undefined, name: string): boolean {
  const all = [...(args ?? []), ...process.argv.slice(2)]
  return all.includes(`--${name}`)
}

/**
 * Backfill product ↔ category links for Axis / Zenitel imports.
 *
 * Usage:
 *   medusa exec ./src/scripts/backfill-manufacturer-categories.ts
 *   medusa exec ./src/scripts/backfill-manufacturer-categories.ts -- --dry-run
 *   medusa exec ./src/scripts/backfill-manufacturer-categories.ts -- --manufacturer=axis
 */
export default async function backfillManufacturerCategories({
  container,
  args,
}: Args) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const dryRun = hasFlag(args, "dry-run")
  const only = parseFlag(args, "manufacturer")?.toLowerCase() ?? null
  const limitRaw = parseFlag(args, "limit")
  const limit = limitRaw ? Number(limitRaw) : null

  logger.info(
    `[category-map] syncing category tree (dryRun=${dryRun}, manufacturer=${only ?? "all"})...`
  )
  const byHandle = await syncSupercoreCategoryTree(container)
  logger.info(`[category-map] ${byHandle.size} category handles available`)

  const handleIndex = buildCategoryHandleIndex()
  const websiteIndex = loadWebsiteCategoryIndex()

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "metadata",
      "categories.id",
      "categories.handle",
    ],
  })

  const targets = (products as any[]).filter((p) => {
    const mid = inferManufacturerId({
      handle: p.handle,
      manufacturerId: p.metadata?.manufacturer_id,
      manufacturer: p.metadata?.manufacturer ?? p.metadata?.brand,
    })
    if (!mid) return false
    if (only && mid !== only) return false
    return true
  })

  const slice =
    limit && Number.isFinite(limit) ? targets.slice(0, limit) : targets

  const stats = {
    scanned: slice.length,
    mapped: 0,
    skipped: 0,
    legacy: 0,
    unchanged: 0,
    missingHandle: 0,
    updated: 0,
    errors: 0,
  }
  const reasonCounts = new Map<string, number>()
  const handleCounts = new Map<string, number>()
  const updates: Array<{ id: string; category_ids: string[] }> = []

  for (const product of slice) {
    const mid = inferManufacturerId({
      handle: product.handle,
      manufacturerId: product.metadata?.manufacturer_id,
      manufacturer:
        product.metadata?.manufacturer ?? product.metadata?.brand,
    })!

    if (isLegacyMedusaProduct(product)) {
      stats.legacy += 1
      continue
    }

    const websiteLeaf = resolveWebsiteCategoryHandle(product.handle, websiteIndex)
    const metaLeaf =
      typeof product.metadata?.category_handle === "string"
        ? product.metadata.category_handle
        : null
    let leafHandle = websiteLeaf ?? metaLeaf

    if (!leafHandle) {
      const mapped = mapManufacturerCategory({
        manufacturerId: mid,
        title: product.title,
        categoryHint: product.metadata?.category_hint,
        sku: product.metadata?.mpn,
      })
      reasonCounts.set(
        mapped.reason,
        (reasonCounts.get(mapped.reason) ?? 0) + 1
      )
      if (mapped.skip || !mapped.handle) {
        stats.skipped += 1
        continue
      }
      leafHandle = mapped.handle
    }

    const assignmentHandle = medusaCategoryHandle(leafHandle, 1, handleIndex)
    if (!assignmentHandle) {
      stats.skipped += 1
      continue
    }

    const categoryId = byHandle.get(assignmentHandle)
    if (!categoryId) {
      stats.missingHandle += 1
      logger.warn(
        `[category-map] unknown handle "${assignmentHandle}" (from ${leafHandle}) for ${product.handle}`
      )
      continue
    }

    handleCounts.set(
      assignmentHandle,
      (handleCounts.get(assignmentHandle) ?? 0) + 1
    )
    stats.mapped += 1

    const current = (product.categories ?? [])
      .map((c: { handle?: string }) => c.handle)
      .filter(Boolean)
      .sort()
    if (current.length === 1 && current[0] === assignmentHandle) {
      stats.unchanged += 1
      continue
    }

    updates.push({ id: product.id, category_ids: [categoryId] })
  }

  logger.info(
    `[category-map] plan: mapped=${stats.mapped} skipped=${stats.skipped} legacy=${stats.legacy} unchanged=${stats.unchanged} missing=${stats.missingHandle} toUpdate=${updates.length}`
  )

  const topHandles = [...handleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
  for (const [handle, count] of topHandles) {
    logger.info(`  handle ${handle}: ${count}`)
  }

  if (dryRun) {
    logger.info("[category-map] dry-run complete — no writes")
    return { dryRun: true, ...stats, pendingUpdates: updates.length }
  }

  const batchSize = 40
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    try {
      await updateProductsWorkflow(container).run({
        input: {
          products: batch,
        },
      })
      stats.updated += batch.length
      logger.info(
        `[category-map] updated ${stats.updated}/${updates.length}`
      )
    } catch (error) {
      stats.errors += batch.length
      logger.error(
        `[category-map] batch failed at offset ${i}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      for (const item of batch) {
        try {
          await updateProductsWorkflow(container).run({
            input: { products: [item] },
          })
          stats.updated += 1
          stats.errors -= 1
        } catch (itemError) {
          logger.error(
            `[category-map] item failed ${item.id}: ${
              itemError instanceof Error
                ? itemError.message
                : String(itemError)
            }`
          )
        }
      }
    }
  }

  logger.info(
    `[category-map] done updated=${stats.updated} errors=${stats.errors}`
  )
  return stats
}
