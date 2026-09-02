import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { syncSupercoreCategoryTree } from "../migration-scripts/sync-category-tree"

/** Sync full Supercore category tree into an existing Medusa database. Safe to re-run. */
export default async function backfillSupercoreCategories({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Syncing Supercore product category tree...")
  const byHandle = await syncSupercoreCategoryTree(container)
  logger.info(`Category sync complete. ${byHandle.size} handles known in database.`)
}
