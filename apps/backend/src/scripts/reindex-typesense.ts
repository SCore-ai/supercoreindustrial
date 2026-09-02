import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  ensureProductsCollection,
  getTypesenseClient,
  PRODUCTS_COLLECTION,
} from "../lib/typesense-client"

/**
 * Reindex all published products into Typesense.
 *
 * Usage:
 *   medusa exec ./src/scripts/reindex-typesense.ts
 */
export default async function reindexTypesense({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const client = getTypesenseClient()
  const eventBus = container.resolve(Modules.EVENT_BUS)

  await ensureProductsCollection()

  const batchSize = 500
  let offset = 0
  let total = 0

  while (true) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "status"],
      filters: {
        status: "published",
      },
      pagination: {
        take: batchSize,
        skip: offset,
      },
    })

    if (!products.length) {
      break
    }

    logger.info(
      `[typesense] reindexing batch offset=${offset} count=${products.length}`
    )

    for (const product of products) {
      await eventBus.emit({
        name: "product.updated",
        data: { id: product.id },
      })
    }

    total += products.length
    offset += products.length

    if (products.length < batchSize) {
      break
    }
  }

  const collection = await client.collections(PRODUCTS_COLLECTION).retrieve()
  logger.info(
    `[typesense] reindex dispatch complete; products=${total}; collection documents=${collection.num_documents}`
  )
}
