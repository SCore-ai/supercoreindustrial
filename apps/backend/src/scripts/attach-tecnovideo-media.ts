import { existsSync, readdirSync, readFileSync, statSync } from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from "@medusajs/medusa/core-flows"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

/**
 * Upload locally scraped Tecnovideo images into Medusa File storage and
 * attach them to Tecnovideo products (no third-party CDN URLs).
 *
 * Source assets:
 *   data/imports/Tecnovideo/assets/<product-slug>/image-*.{png,jpg,webp}
 *
 * Usage:
 *   medusa exec ./src/scripts/attach-tecnovideo-media.ts
 */

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
const MIN_BYTES = 8_000 // skip tiny icons / UI chrome
const MAX_IMAGES_PER_PRODUCT = 4

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

function listLocalImages(assetDir: string) {
  if (!existsSync(assetDir)) {
    return []
  }

  return readdirSync(assetDir)
    .filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .map((name) => {
      const full = path.join(assetDir, name)
      return { name, full, size: statSync(full).size }
    })
    .filter((file) => file.size >= MIN_BYTES)
    .sort((a, b) => {
      // Prefer image-1, then larger files
      const rank = (name: string) => {
        const match = name.match(/^image-(\d+)/i)
        return match ? Number(match[1]) : 999
      }
      const ra = rank(a.name)
      const rb = rank(b.name)
      if (ra !== rb) return ra - rb
      return b.size - a.size
    })
    .slice(0, MAX_IMAGES_PER_PRODUCT)
}

function streamToBase64(filePath: string) {
  return readFileSync(filePath).toString("base64")
}

function productSlugFromHandle(handle: string) {
  // handle: tecnovideo-txptv4 → try assets/txptv4-ptz-camera-station via catalog source
  return handle.replace(/^tecnovideo-/, "")
}

export default async function attachTecnovideoMedia({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const assetsRoot = path.resolve(
    process.cwd(),
    "data/imports/Tecnovideo/assets"
  )
  const catalogSourcePath = path.resolve(
    process.cwd(),
    "data/imports/Tecnovideo/tecnovideo-catalog-source.json"
  )

  const slugBySeries = new Map<string, string>()
  if (existsSync(catalogSourcePath)) {
    const source = JSON.parse(
      await import("fs/promises").then((fs) =>
        fs.readFile(catalogSourcePath, "utf8")
      )
    ) as {
      products?: Array<{ slug: string; series?: string }>
    }
    for (const product of source.products || []) {
      if (product.series) {
        slugBySeries.set(product.series.toUpperCase(), product.slug)
      }
      slugBySeries.set(product.slug.toUpperCase(), product.slug)
    }
  }

  const products = await listManufacturerProducts(container, "tecnovideo", [
    "id",
    "handle",
    "title",
    "thumbnail",
    "metadata",
    "images.url",
  ])

  logger.info(
    `[tecnovideo-media] attaching local images for ${products.length} products from ${assetsRoot}`
  )

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const product of products as Array<{
    id: string
    handle: string
    title?: string
    thumbnail?: string | null
    metadata?: Record<string, unknown> | null
    images?: Array<{ url?: string | null }> | null
  }>) {
    const series =
      String(product.metadata?.mpn || "").toUpperCase() ||
      productSlugFromHandle(product.handle).toUpperCase()
    const slug =
      slugBySeries.get(series) ||
      slugBySeries.get(productSlugFromHandle(product.handle).toUpperCase())

    // Also try matching asset folder by handle suffix or by scanning dirs
    let assetDir = slug ? path.join(assetsRoot, slug) : ""
    if (!assetDir || !existsSync(assetDir)) {
      const handleKey = productSlugFromHandle(product.handle).toLowerCase()
      const dirs = existsSync(assetsRoot) ? readdirSync(assetsRoot) : []
      const hit =
        dirs.find((dir) => dir.toLowerCase() === handleKey) ||
        dirs.find((dir) => dir.toLowerCase().startsWith(`${handleKey}-`)) ||
        dirs.find((dir) => dir.toLowerCase().includes(handleKey))
      assetDir = hit ? path.join(assetsRoot, hit) : ""
    }

    const localImages = assetDir ? listLocalImages(assetDir) : []
    if (!localImages.length) {
      logger.warn(
        `[tecnovideo-media] no local images for ${product.handle} (dir=${assetDir || "missing"})`
      )
      skipped += 1
      continue
    }

    try {
      const files = []
      for (const image of localImages) {
        const ext = path.extname(image.name).toLowerCase()
        const content = streamToBase64(image.full)
        files.push({
          filename: `tecnovideo/${path.basename(assetDir)}/${image.name}`,
          mimeType: mimeFor(ext),
          content,
          access: "public" as const,
        })
      }

      const { result: uploaded } = await uploadFilesWorkflow(container).run({
        input: { files },
      })

      const urls = (uploaded || [])
        .map((file: { url?: string }) => file.url)
        .filter(Boolean) as string[]

      if (!urls.length) {
        logger.warn(`[tecnovideo-media] upload returned no URLs for ${product.handle}`)
        failed += 1
        continue
      }

      // Drop any previous Tecnovideo CDN links by replacing the full image set
      await updateProductsWorkflow(container).run({
        input: {
          products: [
            {
              id: product.id,
              thumbnail: urls[0],
              images: urls.map((url) => ({ url })),
              metadata: {
                ...(product.metadata || {}),
                media_source: "local-import",
                media_asset_dir: path.relative(process.cwd(), assetDir).replace(/\\/g, "/"),
              },
            },
          ],
        },
      })

      updated += 1
      logger.info(
        `[tecnovideo-media] ${product.handle}: ${urls.length} local image(s) attached`
      )
    } catch (error: any) {
      failed += 1
      logger.error(
        `[tecnovideo-media] failed ${product.handle}: ${error?.message || error}`
      )
    }
  }

  logger.info(
    `[tecnovideo-media] done updated=${updated} skipped=${skipped} failed=${failed}`
  )
}
