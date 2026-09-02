import { existsSync, readdirSync, readFileSync, statSync } from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

/**
 * Sync Axis + Zenitel product images from website product folders
 * (manufacturer original filenames) into Medusa File storage.
 *
 *   medusa exec ./src/scripts/sync-axis-zenitel-website-media.ts
 */

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
const MIN_BYTES = 2_000
const MANUFACTURERS = ["axis", "zenitel"] as const

function mimeFor(ext: string) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".webp":
      return "image/webp"
    case ".gif":
      return "image/gif"
    default:
      return "image/png"
  }
}

function listImages(dir: string) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .filter((name) => !/^(hero|thumbnail|thumb|main|image[-_]?\d+)$/i.test(
      path.basename(name, path.extname(name))
    ))
    .map((name) => {
      const full = path.join(dir, name)
      return { name, full, size: statSync(full).size }
    })
    .filter((file) => file.size >= MIN_BYTES)
    .sort((a, b) => a.name.localeCompare(b.name))
}

function loadIndex(productsRoot: string) {
  const indexPath = path.join(productsRoot, "_index.json")
  const bySku = new Map<string, { folder: string; slug: string; manufacturer: string }>()
  const byHandle = new Map<string, { folder: string; slug: string; manufacturer: string }>()
  if (!existsSync(indexPath)) return { bySku, byHandle }
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    products?: Array<{
      slug?: string
      sku?: string
      manufacturer?: string
      medusa_handle?: string
      category_path?: string
    }>
  }
  for (const row of index.products || []) {
    const manufacturer = String(row.manufacturer || "").toLowerCase()
    if (!MANUFACTURERS.includes(manufacturer as (typeof MANUFACTURERS)[number])) {
      continue
    }
    const folder = row.category_path && row.slug
      ? path.join(productsRoot, ...row.category_path.split("/"), row.slug)
      : ""
    if (!folder || !existsSync(path.join(folder, "product.json"))) continue
    const ref = { folder, slug: String(row.slug), manufacturer }
    if (row.sku) bySku.set(`${manufacturer}:${String(row.sku).toLowerCase()}`, ref)
    if (row.medusa_handle) byHandle.set(String(row.medusa_handle).toLowerCase(), ref)
    if (row.slug) byHandle.set(String(row.slug).toLowerCase(), ref)
  }
  return { bySku, byHandle }
}

export default async function syncAxisZenitelWebsiteMedia({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const productsRoot = path.resolve(
    process.cwd(),
    "data/website sources/Products"
  )
  const lookup = loadIndex(productsRoot)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const manufacturer of MANUFACTURERS) {
    const products = await listManufacturerProducts(container, manufacturer, [
      "id",
      "handle",
      "thumbnail",
      "metadata",
      "images.url",
    ])
    logger.info(`[media-sync] ${manufacturer}: ${products.length} products`)

    for (const product of products as Array<{
      id: string
      handle: string
      metadata?: Record<string, unknown> | null
    }>) {
      const sku = String(
        product.metadata?.mpn ||
          product.metadata?.sku ||
          ""
      ).toLowerCase()
      const ref =
        lookup.byHandle.get(product.handle.toLowerCase()) ||
        (sku ? lookup.bySku.get(`${manufacturer}:${sku}`) : null) ||
        null

      if (!ref) {
        skipped += 1
        continue
      }

      const images = [
        ...listImages(path.join(ref.folder, "images/hero")),
        ...listImages(path.join(ref.folder, "images/gallery")),
      ].slice(0, 6)

      if (!images.length) {
        skipped += 1
        continue
      }

      try {
        const files = images.map((image) => ({
          filename: `${manufacturer}/${ref.slug}/${image.name}`,
          mimeType: mimeFor(path.extname(image.name)),
          content: readFileSync(image.full).toString("base64"),
          access: "public" as const,
        }))
        const { result: uploaded } = await uploadFilesWorkflow(container).run({
          input: { files },
        })
        const urls = (uploaded || [])
          .map((file: { url?: string }) => file.url)
          .filter(Boolean) as string[]

        await productModule.updateProducts(product.id, {
          thumbnail: urls[0] || null,
          images: [],
          metadata: {
            ...(product.metadata || {}),
            media_source: "website-sources",
            media_product_dir: path
              .relative(process.cwd(), ref.folder)
              .replace(/\\/g, "/"),
          },
        })
        if (urls.length) {
          await updateProductsWorkflow(container).run({
            input: {
              products: [
                {
                  id: product.id,
                  thumbnail: urls[0],
                  images: urls.map((url) => ({ url })),
                },
              ],
            },
          })
        }
        updated += 1
        if (updated % 50 === 0) {
          logger.info(`[media-sync] progress updated=${updated}`)
        }
      } catch (error: any) {
        failed += 1
        logger.error(
          `[media-sync] failed ${product.handle}: ${error?.message || error}`
        )
      }
    }
  }

  logger.info(
    `[media-sync] done updated=${updated} skipped=${skipped} failed=${failed}`
  )
}
