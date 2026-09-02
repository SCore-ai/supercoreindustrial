import { existsSync, readFileSync } from "fs"
import path from "path"
import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { inferManufacturerId } from "../lib/catalog/category-mapping"
import { resolveProductsRoot } from "../lib/catalog/catalog-handle-lookup"
import {
  resolveProductHandle,
  skuProductHandle,
} from "../lib/catalog/catalog-permalink"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

/**
 * Remap Axis / Spectrum / Tecnovideo / Zenitel Medusa handles from generic
 * manufacturer-SKU codes to the original website product slugs.
 *
 *   medusa exec ./src/scripts/sync-original-product-handles.ts
 */

const MANUFACTURERS = ["axis", "spectrum", "tecnovideo", "zenitel"] as const

type IndexRow = {
  slug: string
  sku?: string | null
  manufacturer?: string | null
  title?: string | null
}

type MedusaProduct = {
  id: string
  handle: string
  metadata?: Record<string, unknown> | null
  variants?: Array<{
    sku?: string | null
    metadata?: Record<string, unknown> | null
  }> | null
}

function skuKey(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

function loadIndexLookup(productsRoot: string) {
  const bySku = new Map<string, string>()
  const byHandle = new Map<string, string>()
  const indexPath = path.join(productsRoot, "_index.json")
  if (!existsSync(indexPath)) {
    return { bySku, byHandle }
  }

  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    products?: IndexRow[]
  }

  for (const row of index.products || []) {
    const manufacturerId = String(row.manufacturer || "").toLowerCase()
    if (!MANUFACTURERS.includes(manufacturerId as (typeof MANUFACTURERS)[number])) {
      continue
    }
    const handle = resolveProductHandle({
      manufacturerId,
      sku: row.sku,
      catalogSlug: row.slug,
      title: row.title,
    })
    const sku = skuKey(row.sku)
    if (sku) {
      bySku.set(`${manufacturerId}:${sku}`, handle)
      byHandle.set(skuProductHandle(manufacturerId, row.sku), handle)
    }
    byHandle.set(handle, handle)
    byHandle.set(String(row.slug || "").toLowerCase(), handle)
  }

  return { bySku, byHandle }
}

function tempHandle(productId: string) {
  return `tmp-rehandle-${productId.replace(/_/g, "-")}`.toLowerCase()
}

async function updateHandles(
  productModule: {
    updateProducts: (id: string, data: { handle: string }) => Promise<unknown>
  },
  items: Array<{ id: string; handle: string }>,
  logger: { info: (message: string) => void },
  label: string,
  concurrency = 5
) {
  let done = 0
  for (let index = 0; index < items.length; index += concurrency) {
    const batch = items.slice(index, index + concurrency)
    await Promise.all(
      batch.map((item) =>
        productModule.updateProducts(item.id, { handle: item.handle })
      )
    )
    done += batch.length
    if (done % 100 === 0 || done === items.length) {
      logger.info(`[handle-sync] ${label} ${done}/${items.length}`)
    }
  }
}

export default async function syncOriginalProductHandles({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const { bySku, byHandle } = loadIndexLookup(resolveProductsRoot())

  const products: MedusaProduct[] = []
  const seen = new Set<string>()
  for (const manufacturerId of MANUFACTURERS) {
    const rows = (await listManufacturerProducts(
      container,
      manufacturerId,
      ["id", "handle", "metadata", "variants.sku", "variants.metadata"],
      3000
    )) as MedusaProduct[]
    for (const product of rows) {
      if (!seen.has(product.id)) {
        products.push(product)
        seen.add(product.id)
      }
    }
  }

  logger.info(
    `[handle-sync] index=${byHandle.size} medusa=${products.length}`
  )

  const claimed = new Set<string>()
  const updates: Array<{ id: string; from: string; to: string }> = []

  for (const product of products) {
    const manufacturerId = inferManufacturerId({
      handle: product.handle,
      manufacturerId:
        typeof product.metadata?.manufacturer_id === "string"
          ? product.metadata.manufacturer_id
          : null,
      manufacturer:
        typeof product.metadata?.manufacturer === "string"
          ? product.metadata.manufacturer
          : null,
    })
    const variantSku = product.variants?.find((variant) => variant.sku)?.sku
    const parentSku = product.variants?.find(
      (variant) => variant.metadata?.parent_sku
    )?.metadata?.parent_sku
    const mpn =
      typeof product.metadata?.mpn === "string" ? product.metadata.mpn : null
    const nextHandle =
      byHandle.get(product.handle.toLowerCase()) ||
      (manufacturerId && variantSku
        ? bySku.get(`${manufacturerId}:${skuKey(variantSku)}`)
        : undefined) ||
      (manufacturerId && parentSku
        ? bySku.get(`${manufacturerId}:${skuKey(String(parentSku))}`)
        : undefined) ||
      (manufacturerId && mpn
        ? bySku.get(`${manufacturerId}:${skuKey(mpn)}`)
        : undefined)

    if (!nextHandle) {
      continue
    }
    if (claimed.has(nextHandle) && product.handle !== nextHandle) {
      logger.warn(
        `[handle-sync] skip duplicate ${product.handle} -> ${nextHandle}`
      )
      continue
    }
    claimed.add(nextHandle)
    if (product.handle === nextHandle) {
      continue
    }
    updates.push({ id: product.id, from: product.handle, to: nextHandle })
  }

  logger.info(`[handle-sync] changing=${updates.length}`)

  await updateHandles(
    productModule,
    updates.map((item) => ({
      id: item.id,
      handle: tempHandle(item.id),
    })),
    logger,
    "temp"
  )
  await updateHandles(
    productModule,
    updates.map((item) => ({
      id: item.id,
      handle: item.to,
    })),
    logger,
    "final"
  )

  for (const item of updates.slice(0, 12)) {
    logger.info(`[handle-sync] ${item.from} -> ${item.to}`)
  }

  logger.info(`[handle-sync] done updated=${updates.length}`)
}
