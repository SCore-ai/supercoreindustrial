import fs from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runZenitelImport } from "../lib/catalog/zenitel-import"

const FILES = [
  "zenitel-safety-security-pricelist-2026-eur.csv",
  "zenitel-safety-security-spare-parts-2026-eur.csv",
  "zenitel-maritime-energy-pricelist-q2-2026-eur.csv",
]

/** Import normalized Zenitel CSVs from data/imports/zenitel into the catalog. */
export default async function importZenitelCsvs({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dir = path.join(process.cwd(), "data", "imports", "zenitel")

  for (const filename of FILES) {
    const filePath = path.join(dir, filename)
    if (!fs.existsSync(filePath)) {
      logger.error(`[zenitel-import] Missing file: ${filePath}`)
      continue
    }

    const csv = fs.readFileSync(filePath, "utf8")
    logger.info(`[zenitel-import] Starting ${filename} (${csv.length} bytes)...`)

    const result = await runZenitelImport(container, {
      csv,
      filename,
      source_currency: "eur",
    })

    logger.info(
      `[zenitel-import] ${filename}: status=${result.status} imported=${result.imported_count} skipped=${result.skipped_count} errors=${result.error_count} job=${result.job_id}`
    )

    if (result.errors?.length) {
      for (const err of result.errors.slice(0, 5)) {
        logger.warn(`[zenitel-import] ${err.sku}: ${err.message}`)
      }
    }
  }

  logger.info("[zenitel-import] All files processed.")
}
