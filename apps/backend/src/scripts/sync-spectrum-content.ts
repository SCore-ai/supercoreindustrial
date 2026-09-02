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

/**
 * Sync Spectrum title, description, SEO handle, and media from website folders.
 *
 * Handles match explosionproofcamera.com permalink slugs
 * (e.g. tezp-405-30-explosion-proof-camera). Image uploads keep original
 * manufacturer filenames. If a local file is missing, the Spectrum CDN URL
 * from product.json is attached instead.
 *
 *   medusa exec ./src/scripts/sync-spectrum-content.ts
 */

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
const GENERIC_IMAGE = /^(hero|gallery-\d+|gallery-img)(\.[a-z0-9]+)?$/i
const MIN_BYTES = 500

type FolderMeta = {
  slug: string
  sku?: string | null
  title?: string
  description?: string | null
  permalink?: string | null
  source_url?: string | null
  medusa_handle?: string | null
  category_path?: string
  images?: Array<{ role?: string; filename?: string; source_url?: string }>
}

type LocalImage = { name: string; full: string; size: number }

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

function listImagesIn(dir: string): LocalImage[] {
  if (!existsSync(dir)) return []
  const files = readdirSync(dir)
    .filter((name) => IMAGE_EXTS.has(path.extname(name).toLowerCase()))
    .map((name) => {
      const full = path.join(dir, name)
      return { name, full, size: statSync(full).size }
    })
    .filter((file) => file.size >= MIN_BYTES)
    .sort((a, b) => a.name.localeCompare(b.name))
  const originals = files.filter((file) => !GENERIC_IMAGE.test(file.name))
  return originals.length ? originals : files
}

function collectSpectrumFolders(root: string) {
  const acc: Array<{ dir: string; meta: FolderMeta }> = []
  const indexPath = path.join(root, "_index.json")
  if (!existsSync(indexPath)) {
    return acc
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    products?: Array<{
      slug: string
      sku?: string | null
      manufacturer?: string | null
      category_path?: string
    }>
  }
  for (const row of index.products || []) {
    if (String(row.manufacturer || "").toLowerCase() !== "spectrum") {
      continue
    }
    const dir = path.join(
      root,
      ...String(row.category_path || "").split("/"),
      row.slug
    )
    const metaPath = path.join(dir, "product.json")
    if (!existsSync(metaPath)) {
      continue
    }
    acc.push({
      dir,
      meta: JSON.parse(readFileSync(metaPath, "utf8")) as FolderMeta,
    })
  }
  return acc
}

function skuKey(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

function legacyHandle(sku?: string | null) {
  const key = skuKey(sku)
  if (!key) return ""
  return `spectrum-${key.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
}

export default async function syncSpectrumContent({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)

  const productsRoot = path.resolve(
    process.cwd(),
    "data/website sources/Products"
  )
  const folders = collectSpectrumFolders(productsRoot)
  const bySku = new Map<string, (typeof folders)[number]>()
  const byHandle = new Map<string, (typeof folders)[number]>()
  for (const folder of folders) {
    const sku = skuKey(folder.meta.sku)
    if (sku) {
      bySku.set(sku, folder)
    }
    const handle = folder.meta.slug || folder.meta.medusa_handle
    if (handle) {
      byHandle.set(handle.toLowerCase(), folder)
    }
    const oldHandle = legacyHandle(folder.meta.sku)
    if (oldHandle) {
      byHandle.set(oldHandle, folder)
    }
  }

  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
    filters: { handle: "spectrum" },
  })
  const collectionId = collections?.[0]?.id as string | undefined

  const products: Array<{
    id: string
    handle: string
    title?: string
    description?: string | null
    metadata?: Record<string, unknown> | null
  }> = []

  if (collectionId) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "title",
        "description",
        "thumbnail",
        "metadata",
        "variants.sku",
        "variants.metadata",
      ],
      filters: { collection_id: collectionId },
      pagination: { take: 2000 },
    })
    products.push(...((data ?? []) as typeof products))
  }

  const { data: byLegacy } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "title",
      "description",
      "thumbnail",
      "metadata",
      "variants.sku",
      "variants.metadata",
    ],
    filters: { handle: { $like: "spectrum-%" } },
    pagination: { take: 2000 },
  })
  const seen = new Set(products.map((product) => product.id))
  for (const product of (byLegacy ?? []) as typeof products) {
    if (!seen.has(product.id)) {
      products.push(product)
      seen.add(product.id)
    }
  }

  logger.info(
    `[spectrum-sync] folders=${folders.length} medusa=${products.length}`
  )

  let updated = 0
  let failed = 0
  let unmatched = 0

  for (const product of products as Array<{
    id: string
    handle: string
    title?: string
    description?: string | null
    metadata?: Record<string, unknown> | null
    variants?: Array<{
      sku?: string | null
      metadata?: Record<string, unknown> | null
    }> | null
  }>) {
    const meta = product.metadata || {}
    const variantSku = product.variants?.find((variant) => variant.sku)?.sku
    const parentSku = product.variants?.find(
      (variant) => variant.metadata?.parent_sku
    )?.metadata?.parent_sku
    const folder =
      byHandle.get(product.handle.toLowerCase()) ||
      bySku.get(skuKey(String(meta.mpn || ""))) ||
      bySku.get(skuKey(String(parentSku || ""))) ||
      bySku.get(skuKey(String(variantSku || ""))) ||
      byHandle.get(legacyHandle(String(meta.mpn || variantSku || "")))

    if (!folder) {
      unmatched += 1
      logger.warn(`[spectrum-sync] no folder for ${product.handle}`)
      continue
    }

    const nextHandle = folder.meta.slug || folder.meta.medusa_handle
    const description = String(folder.meta.description || "").trim()
    const title = String(folder.meta.title || "").trim()
    const permalink = folder.meta.permalink || folder.meta.source_url || null
    try {
      const cdnUrls = (folder.meta.images || [])
        .map((image) => image.source_url)
        .filter((url): url is string => Boolean(url))

      let urls = cdnUrls
      let mediaSource = urls.length ? "spectrum-cdn" : meta.media_source
      if (!urls.length) {
        const hero = listImagesIn(path.join(folder.dir, "images", "hero"))
        const gallery = listImagesIn(path.join(folder.dir, "images", "gallery"))
        const localImages = [...hero, ...gallery]
        if (localImages.length) {
          const files = localImages.map((image) => ({
            filename: `spectrum/${path.basename(folder.dir)}/${image.name}`,
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
          mediaSource = urls.length ? "website-sources" : mediaSource
        }
      }

      await productModule.updateProducts(product.id, {
        handle: nextHandle,
        ...(title ? { title } : {}),
        description: description || undefined,
        metadata: {
          ...meta,
          manufacturer: "Spectrum",
          manufacturer_id: "spectrum",
          brand: "Spectrum",
          source_url: permalink,
          permalink,
          media_source: mediaSource,
          media_product_dir: path
            .relative(process.cwd(), folder.dir)
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
      logger.info(
        `[spectrum-sync] ${product.handle} -> ${nextHandle} images=${urls.length} desc=${description.length}c`
      )
    } catch (error: any) {
      failed += 1
      logger.error(
        `[spectrum-sync] failed ${product.handle}: ${error?.message || error}`
      )
    }
  }

  logger.info(
    `[spectrum-sync] done updated=${updated} unmatched=${unmatched} failed=${failed}`
  )
}
