import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { runManufacturerImport } from "../lib/catalog/manufacturer-import"

/**
 * Replace existing Axis products with the merged EUR+GBP CSV
 * (includes Product Description from source files).
 */
export default async function reimportAxisMerged({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: {
      handle: { $like: "axis-%" },
    },
  })

  const ids = (existing ?? []).map((p: { id: string }) => p.id)
  logger.info(`[axis-reimport] Found ${ids.length} existing Axis products to remove`)

  if (ids.length) {
    const chunk = 50
    for (let i = 0; i < ids.length; i += chunk) {
      const batch = ids.slice(i, i + chunk)
      await deleteProductsWorkflow(container).run({
        input: { ids: batch },
      })
      logger.info(
        `[axis-reimport] Deleted ${Math.min(i + chunk, ids.length)}/${ids.length}`
      )
    }
  }

  const filename = "axis-pricelist-august-2026-merged-eur-gbp.csv"
  const filePath = path.join(
    process.cwd(),
    "data",
    "imports",
    "axis",
    filename
  )
  const csv = fs.readFileSync(filePath, "utf8")
  logger.info(`[axis-reimport] Importing ${filename} (${csv.length} bytes)...`)

  const result = await runManufacturerImport(container, {
    manufacturer: "axis",
    csv,
    filename,
    source_currency: "gbp",
  })

  logger.info(
    `[axis-reimport] status=${result.status} imported=${result.imported_count} skipped=${result.skipped_count} errors=${result.error_count}`
  )

  // Spot-check: ensure descriptions landed
  const { data: sample } = await query.graph({
    entity: "product",
    fields: ["id", "title", "description", "handle"],
    filters: { handle: "axis-02968-001" },
  })
  const one = sample?.[0]
  if (one) {
    logger.info(
      `[axis-reimport] sample ${one.handle}: title=${one.title} descLen=${(one.description || "").length}`
    )
  }

  for (const err of result.errors.slice(0, 8)) {
    logger.warn(`[axis-reimport] ${err.sku}: ${err.message}`)
  }
}
