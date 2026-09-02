import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runZenitelImport } from "../lib/catalog/zenitel-import"

/**
 * Re-import Maritime list only. Existing SKUs from the first pass are skipped
 * via per-item fallback in runZenitelImport.
 */
export default async function importZenitelMaritimeRetry({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const filename = "zenitel-maritime-energy-pricelist-q2-2026-eur.csv"
  const filePath = path.join(
    process.cwd(),
    "data",
    "imports",
    "zenitel",
    filename
  )

  const csv = fs.readFileSync(filePath, "utf8")
  logger.info(`[zenitel-import] Retry maritime import (${csv.length} bytes)...`)

  const result = await runZenitelImport(container, {
    csv,
    filename: `${filename}.retry`,
    source_currency: "eur",
  })

  logger.info(
    `[zenitel-import] retry: status=${result.status} imported=${result.imported_count} skipped=${result.skipped_count} errors=${result.error_count}`
  )

  for (const err of result.errors.slice(0, 15)) {
    logger.warn(`[zenitel-import] ${err.sku}: ${err.message}`)
  }
}
