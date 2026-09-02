import { readFileSync } from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runManufacturerImport } from "../lib/catalog/manufacturer-import"

/**
 * Import Tecnovideo catalog as quote-only (Hide Price).
 *
 * Products publish without public prices so the storefront shows
 * "Hide Price" + Request Quote / Add to quote.
 *
 * Usage:
 *   medusa exec ./src/scripts/import-tecnovideo.ts
 */
export default async function importTecnovideoCatalog({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const csvPath = path.resolve(
    process.cwd(),
    "data/imports/Tecnovideo/tecnovideo-pricelist-eur.csv"
  )
  const csv = readFileSync(csvPath, "utf8")

  logger.info(
    `[tecnovideo-import] Importing quote-only (Hide Price) catalog from ${csvPath}`
  )
  const result = await runManufacturerImport(container, {
    manufacturer: "tecnovideo",
    csv,
    filename: "tecnovideo-pricelist-eur.csv",
    source_currency: "eur",
    quoteOnly: true,
  })

  logger.info(
    `Tecnovideo import ${result.status}: imported=${result.imported_count} skipped=${result.skipped_count} errors=${result.error_count}`
  )
  if (result.errors.length) {
    for (const error of result.errors.slice(0, 30)) {
      logger.warn(`  ${error.sku}: ${error.message}`)
    }
  }
}
