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
 * Sync Tecnovideo descriptions + media from website product folders.
 *
 * Canonical media:
 *   data/website sources/Products/{area}/{category}/{slug}/images/hero|gallery
 *   …/documents/datasheet/{original-filename}
 *
 * Medusa File uploads keep the manufacturer original filenames.
 *
 * Usage:
 *   medusa exec ./src/scripts/sync-tecnovideo-content.ts
 */

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
const MIN_BYTES = 8_000

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

function listImagesIn(dir: string) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .map((name) => {
      const full = path.join(dir, name)
      return { name, full, size: statSync(full).size }
    })
    .filter((file) => file.size >= MIN_BYTES)
    .sort((a, b) => a.name.localeCompare(b.name))
}

function productSlugFromHandle(handle: string) {
  return handle.replace(/^tecnovideo-/, "")
}

function normalizeSeriesKey(value: string) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+$/g, "")
    .trim()
}

function findProductDir(
  productsRoot: string,
  slug: string,
  categoryPathOrFolder?: string | null
) {
  if (categoryPathOrFolder) {
    const normalized = categoryPathOrFolder
      .replace(/^data\/website sources\/Products\//i, "")
      .replace(/\\/g, "/")
      .replace(/\/+$/, "")

    // folder may already include the slug
    const direct = path.join(productsRoot, ...normalized.split("/"))
    if (
      existsSync(path.join(direct, "product.json")) &&
      path.basename(direct).toLowerCase() === slug.toLowerCase()
    ) {
      return direct
    }

    const withSlug = path.join(productsRoot, ...normalized.split("/"), slug)
    if (existsSync(path.join(withSlug, "product.json"))) {
      return withSlug
    }
  }

  // Fast leaf lookup: exact slug, then prefix (e.g. txfdtv32 → txfdtv32-xx-…)
  const needle = slug.toLowerCase()
  for (const area of ["hazardous-area", "safe-area"]) {
    const areaDir = path.join(productsRoot, area)
    if (!existsSync(areaDir)) continue
    for (const leaf of readdirSync(areaDir)) {
      const leafDir = path.join(areaDir, leaf)
      let names: string[] = []
      try {
        names = readdirSync(leafDir)
      } catch {
        continue
      }
      const exact = names.find((name) => name.toLowerCase() === needle)
      const prefixed = names.find(
        (name) =>
          name.toLowerCase().startsWith(`${needle}-`) ||
          name.toLowerCase().startsWith(`${needle}xx`)
      )
      const hit = exact || prefixed
      if (hit) {
        const candidate = path.join(leafDir, hit)
        if (existsSync(path.join(candidate, "product.json"))) {
          return candidate
        }
      }
    }
  }

  return ""
}

function resolveCatalogEntry(
  products: Array<{
    slug: string
    series?: string
  }>,
  series: string,
  handleKey: string
) {
  const bySeries = new Map<string, (typeof products)[number]>()
  const bySlug = new Map<string, (typeof products)[number]>()

  for (const product of products) {
    bySlug.set(product.slug.toLowerCase(), product)
    if (product.series) {
      const raw = product.series.toUpperCase()
      bySeries.set(raw, product)
      bySeries.set(normalizeSeriesKey(raw), product)
    }
    // Index first path segment: txfdtv32-xx-thermal-… → txfdtv32
    const prefix = product.slug.toLowerCase().split("-")[0]
    if (prefix) {
      bySlug.set(prefix, product)
    }
  }

  const seriesKey = normalizeSeriesKey(series)
  return (
    bySeries.get(series.toUpperCase()) ||
    bySeries.get(seriesKey) ||
    bySlug.get(handleKey.toLowerCase()) ||
    bySlug.get(seriesKey.toLowerCase()) ||
    null
  )
}

export default async function syncTecnovideoContent({
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
  const catalogSourcePath = path.join(
    productsRoot,
    "_mapping",
    "tecnovideo-catalog-source.json"
  )

  const source = JSON.parse(readFileSync(catalogSourcePath, "utf8")) as {
    products?: Array<{
      slug: string
      series?: string
      title?: string
      description?: string
      subtitle?: string
      features?: string[]
      category_path?: string
      category_handle?: string
      folder?: string
    }>
  }

  const catalogProducts = source.products || []

  const products = await listManufacturerProducts(container, "tecnovideo", [
    "id",
    "handle",
    "title",
    "description",
    "thumbnail",
    "metadata",
    "images.id",
    "images.url",
  ])

  logger.info(
    `[tecnovideo-sync] updating ${products.length} products from website sources`
  )

  let updated = 0
  let failed = 0

  for (const product of products as Array<{
    id: string
    handle: string
    description?: string | null
    metadata?: Record<string, unknown> | null
  }>) {
    const series =
      String(product.metadata?.mpn || "").toUpperCase() ||
      productSlugFromHandle(product.handle).toUpperCase()
    const handleKey = productSlugFromHandle(product.handle).toLowerCase()

    const catalog = resolveCatalogEntry(catalogProducts, series, handleKey)

    const productDir = catalog
      ? findProductDir(
          productsRoot,
          catalog.slug,
          catalog.category_path ||
            (catalog.folder
              ? catalog.folder.replace(/^data\/website sources\/Products\//, "")
              : null)
        )
      : findProductDir(productsRoot, handleKey, null)

    let description = ""
    let features: string[] | null = null
    if (productDir && existsSync(path.join(productDir, "product.json"))) {
      const meta = JSON.parse(
        readFileSync(path.join(productDir, "product.json"), "utf8")
      ) as {
        description?: string
        subtitle?: string
        features?: string[]
      }
      description = (meta.description || meta.subtitle || "").trim()
      features = meta.features || null
    } else {
      description = (catalog?.description || catalog?.subtitle || "").trim()
      features = catalog?.features || null
    }

    const heroImages = listImagesIn(path.join(productDir, "images", "hero"))
    const galleryImages = listImagesIn(
      path.join(productDir, "images", "gallery")
    )
    const localImages = [...heroImages, ...galleryImages]

    try {
      let urls: string[] = []

      if (localImages.length) {
        const files = localImages.map((image) => ({
          filename: `tecnovideo/${path.basename(productDir)}/${image.name}`,
          mimeType: mimeFor(path.extname(image.name)),
          content: readFileSync(image.full).toString("base64"),
          access: "public" as const,
        }))

        const { result: uploaded } = await uploadFilesWorkflow(container).run({
          input: { files },
        })
        urls = (uploaded || [])
          .map((file: { url?: string }) => file.url)
          .filter(Boolean) as string[]
      }

      const nextHandle = catalog?.slug
        ? String(catalog.slug).toLowerCase()
        : null

      await productModule.updateProducts(product.id, {
        ...(nextHandle ? { handle: nextHandle } : {}),
        description: description || undefined,
        thumbnail: urls[0] || null,
        images: [],
        metadata: {
          ...(product.metadata || {}),
          media_source: urls.length ? "website-sources" : product.metadata?.media_source,
          media_product_dir: productDir
            ? path.relative(process.cwd(), productDir).replace(/\\/g, "/")
            : product.metadata?.media_product_dir,
          features: features || product.metadata?.features || null,
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
      logger.info(
        `[tecnovideo-sync] ${product.handle}: files=${localImages.map((i) => i.name).join("|") || "-"} desc=${description.length}c`
      )
    } catch (error: any) {
      failed += 1
      logger.error(
        `[tecnovideo-sync] failed ${product.handle}: ${error?.message || error}`
      )
    }
  }

  logger.info(`[tecnovideo-sync] done updated=${updated} failed=${failed}`)
}
