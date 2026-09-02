import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

export default async function verifyTecnovideoMedia({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const products = await listManufacturerProducts(container, "tecnovideo", [
    "id",
    "handle",
    "thumbnail",
    "images.url",
    "metadata",
  ])

  let local = 0
  let external = 0
  let empty = 0

  for (const product of products as Array<{
    handle: string
    thumbnail?: string | null
    images?: Array<{ url?: string | null }> | null
  }>) {
    const urls = [
      product.thumbnail,
      ...((product.images || []).map((image) => image.url) || []),
    ].filter(Boolean) as string[]

    if (!urls.length) {
      empty += 1
      logger.warn(`[verify] empty ${product.handle}`)
      continue
    }

    const hasExternal = urls.some(
      (url) =>
        /tecnovideocctv\.com/i.test(url) ||
        (/^https?:\/\//i.test(url) &&
          !/localhost:9000\/static/i.test(url) &&
          !/\/static\//i.test(url))
    )
    const hasLocal = urls.every(
      (url) =>
        /localhost:9000\/static/i.test(url) ||
        /\/static\//i.test(url) ||
        url.startsWith("/")
    )

    if (hasExternal) {
      external += 1
      logger.warn(`[verify] EXTERNAL ${product.handle} => ${urls[0]}`)
    } else if (hasLocal) {
      local += 1
    } else {
      external += 1
      logger.warn(`[verify] UNKNOWN ${product.handle} => ${urls[0]}`)
    }
  }

  logger.info(
    `[verify] sample=${(products[0] as any)?.handle} thumbnail=${(products[0] as any)?.thumbnail}`
  )
  logger.info(
    `[verify] total=${products.length} local=${local} external=${external} empty=${empty}`
  )
}
