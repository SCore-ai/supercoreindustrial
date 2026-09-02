import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runManufacturerImport } from "../lib/catalog/manufacturer-import"

/** Import merged Axis EUR+GBP August 2026 price list. */
export default async function importAxisMerged({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const filename = "axis-pricelist-august-2026-merged-eur-gbp.csv"
  const filePath = path.join(
    process.cwd(),
    "data",
    "imports",
    "axis",
    filename
  )

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath}`)
  }

  const csv = fs.readFileSync(filePath, "utf8")
  logger.info(`[axis-import] Starting merged import (${csv.length} bytes)...`)

  const result = await runManufacturerImport(container, {
    manufacturer: "axis",
    csv,
    filename,
    source_currency: "gbp",
  })

  logger.info(
    `[axis-import] status=${result.status} imported=${result.imported_count} skipped=${result.skipped_count} errors=${result.error_count} job=${result.job_id}`
  )

  for (const err of result.errors.slice(0, 10)) {
    logger.warn(`[axis-import] ${err.sku}: ${err.message}`)
  }
}
