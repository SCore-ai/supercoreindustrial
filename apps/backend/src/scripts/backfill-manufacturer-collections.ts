import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { inferManufacturerId } from "../lib/catalog/category-mapping"
import { ensureAllManufacturerCollections } from "../lib/catalog/manufacturer-collections"

type Args = {
  container: MedusaContainer
  args?: string[]
}

function hasFlag(args: string[] | undefined, name: string): boolean {
  const all = [...(args ?? []), ...process.argv.slice(2)]
  return all.includes(`--${name}`)
}

/**
 * Create brand collections (Axis, Zenitel, Spectrum, Tecnovideo, Cisco)
 * and assign catalog products to the matching collection.
 *
 *   medusa exec ./src/scripts/backfill-manufacturer-collections.ts
 *   medusa exec ./src/scripts/backfill-manufacturer-collections.ts -- --dry-run
 */
export default async function backfillManufacturerCollections({
  container,
  args,
}: Args) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const dryRun = hasFlag(args, "dry-run")

  const collectionIds = await ensureAllManufacturerCollections(container)
  logger.info(
    `[brand-collections] ${collectionIds.size} manufacturer collections ready: ${[
      ...collectionIds.keys(),
    ].join(", ")}`
  )

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "collection_id",
      "collection.id",
      "collection.handle",
      "metadata",
    ],
  })

  const stats = {
    scanned: (products as unknown[]).length,
    assigned: 0,
    unchanged: 0,
    unmatched: 0,
    updated: 0,
    errors: 0,
  }
  const byBrand = new Map<string, number>()
  const updates: Array<{ id: string; collection_id: string }> = []

  for (const product of products as Array<{
    id: string
    handle?: string | null
    collection_id?: string | null
    collection?: { id?: string; handle?: string | null } | null
    metadata?: Record<string, unknown> | null
  }>) {
    const manufacturerId = inferManufacturerId({
      handle: product.handle,
      manufacturerId:
        (product.metadata?.manufacturer_id as string | undefined) ?? null,
      manufacturer:
        (product.metadata?.manufacturer as string | undefined) ??
        (product.metadata?.brand as string | undefined) ??
        null,
    })

    if (!manufacturerId) {
      stats.unmatched += 1
      continue
    }

    const collectionId = collectionIds.get(manufacturerId)
    if (!collectionId) {
      stats.unmatched += 1
      continue
    }

    byBrand.set(manufacturerId, (byBrand.get(manufacturerId) ?? 0) + 1)

    const currentHandle = product.collection?.handle ?? null
    const currentId = product.collection_id ?? product.collection?.id ?? null
    if (currentHandle === manufacturerId || currentId === collectionId) {
      stats.unchanged += 1
      continue
    }

    stats.assigned += 1
    updates.push({ id: product.id, collection_id: collectionId })
  }

  logger.info(
    `[brand-collections] plan scanned=${stats.scanned} assign=${stats.assigned} unchanged=${stats.unchanged} unmatched=${stats.unmatched}`
  )
  for (const [brand, count] of [...byBrand.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    logger.info(`  ${brand}: ${count}`)
  }

  if (dryRun) {
    logger.info("[brand-collections] dry-run complete — no writes")
    return { dryRun: true, ...stats, pendingUpdates: updates.length }
  }

  const batchSize = 40
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    try {
      await updateProductsWorkflow(container).run({
        input: { products: batch },
      })
      stats.updated += batch.length
      logger.info(
        `[brand-collections] updated ${stats.updated}/${updates.length}`
      )
    } catch (error) {
      stats.errors += batch.length
      logger.error(
        `[brand-collections] batch failed at offset ${i}: ${
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
            `[brand-collections] item failed ${item.id}: ${
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
    `[brand-collections] done updated=${stats.updated} errors=${stats.errors}`
  )
  return stats
}
