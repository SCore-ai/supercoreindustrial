import { readFileSync } from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { runManufacturerImport } from "../lib/catalog/manufacturer-import"

export default async function importSpectrumCatalog({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
    filters: { handle: "spectrum" },
  })
  const collectionId = collections?.[0]?.id as string | undefined

  const ids = new Set<string>()
  if (collectionId) {
    const { data: inCollection } = await query.graph({
      entity: "product",
      fields: ["id"],
      filters: { collection_id: collectionId },
      pagination: { take: 2000 },
    })
    for (const product of inCollection ?? []) {
      ids.add(product.id)
    }
  }
  const { data: byHandle } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: { $like: "spectrum-%" } },
    pagination: { take: 2000 },
  })
  for (const product of byHandle ?? []) {
    ids.add(product.id)
  }

  logger.info(
    `[spectrum-import] Removing ${ids.size} existing Spectrum products before variant import`
  )
  const chunk = 50
  const idList = [...ids]
  for (let i = 0; i < idList.length; i += chunk) {
    await deleteProductsWorkflow(container).run({
      input: { ids: idList.slice(i, i + chunk) },
    })
  }

  const csvPath = path.resolve(
    process.cwd(),
    "data/imports/Spectrum/spectrum-pricelist-usd.csv"
  )
  const csv = readFileSync(csvPath, "utf8")

  logger.info(`Importing Spectrum catalog (with variations) from ${csvPath}`)
  const result = await runManufacturerImport(container, {
    manufacturer: "spectrum",
    csv,
    filename: "spectrum-pricelist-usd.csv",
    source_currency: "usd",
  })

  logger.info(
    `Spectrum import ${result.status}: imported=${result.imported_count} skipped=${result.skipped_count} errors=${result.error_count}`
  )
  if (result.errors.length) {
    for (const error of result.errors) {
      logger.warn(`  ${error.sku}: ${error.message}`)
    }
  }
}
