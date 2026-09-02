import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

/**
 * Verify TXFDTV32 / TSFDTV32 media after sync.
 *   medusa exec ./src/scripts/verify-dtv32-media.ts
 */
export default async function verifyDtv32Media({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const products = await listManufacturerProducts(container, "tecnovideo", [
    "handle",
    "title",
    "description",
    "thumbnail",
    "metadata",
    "images.url",
  ])

  const hits = (products as any[]).filter((p) =>
    /dtv32/i.test(p.handle || "") ||
    /dtv32/i.test(String(p.metadata?.mpn || "")) ||
    /dtv32/i.test(p.title || "")
  )

  for (const product of hits) {
    logger.info(
      `[dtv32] handle=${product.handle} mpn=${product.metadata?.mpn} images=${(product.images || []).length} thumb=${product.thumbnail} desc=${(product.description || "").length}c dir=${product.metadata?.media_product_dir || "-"}`
    )
  }
  logger.info(`[dtv32] matched=${hits.length}`)
}
