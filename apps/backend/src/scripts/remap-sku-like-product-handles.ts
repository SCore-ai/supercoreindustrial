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
  isSkuLikeCatalogSlug,
  resolveProductHandle,
  resolveSkuLikeProductHandle,
} from "../lib/catalog/catalog-permalink"
import { listManufacturerProducts } from "../lib/catalog/manufacturer-collections"

/**
 * Remap leftover manufacturer-SKU Medusa handles to title-based catalog slugs.
 *
 *   medusa exec ./src/scripts/remap-sku-like-product-handles.ts
 */

const MANUFACTURERS = ["axis", "spectrum", "tecnovideo", "zenitel"] as const

type MedusaProduct = {
  id: string
  handle: string
  title?: string | null
  metadata?: Record<string, unknown> | null
  variants?: Array<{
    sku?: string | null
    metadata?: Record<string, unknown> | null
  }> | null
}

function uniqueHandle(base: string, taken: Set<string>): string | null {
  let candidate = base
  let suffix = 2
  while (taken.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
    if (suffix > 50) {
      return null
    }
  }
  taken.add(candidate)
  return candidate
}

function skuKey(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

function loadIndexLookup() {
  const bySku = new Map<string, string>()
  const indexPath = path.join(resolveProductsRoot(), "_index.json")
  if (!existsSync(indexPath)) {
    return bySku
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    products?: Array<{
      slug?: string
      sku?: string | null
      manufacturer?: string | null
      title?: string | null
    }>
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
    }
  }
  return bySku
}

function tempHandle(productId: string) {
  return `tmp-rehandle-${productId.replace(/_/g, "-")}`.toLowerCase()
}

export default async function remapSkuLikeProductHandles({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const bySku = loadIndexLookup()

  const productsByManufacturer = new Map<string, MedusaProduct[]>()
  const claimed = new Set<string>()

  for (const manufacturerId of MANUFACTURERS) {
    const products = (await listManufacturerProducts(
      container,
      manufacturerId,
      [
        "id",
        "handle",
        "title",
        "metadata",
        "variants.sku",
        "variants.metadata",
      ],
      3000
    )) as MedusaProduct[]
    productsByManufacturer.set(manufacturerId, products)
    for (const product of products) {
      claimed.add(product.handle.toLowerCase())
    }
  }

  const updates: Array<{ id: string; from: string; to: string }> = []

  for (const manufacturerId of MANUFACTURERS) {
    const products = productsByManufacturer.get(manufacturerId) || []

    for (const product of products) {
      const inferred = inferManufacturerId({
        handle: product.handle,
        manufacturerId:
          typeof product.metadata?.manufacturer_id === "string"
            ? product.metadata.manufacturer_id
            : manufacturerId,
        manufacturer:
          typeof product.metadata?.manufacturer === "string"
            ? product.metadata.manufacturer
            : null,
      })
      const brand = inferred || manufacturerId
      const variantSku = product.variants?.find((variant) => variant.sku)?.sku
      const parentSku = product.variants?.find(
        (variant) => variant.metadata?.parent_sku
      )?.metadata?.parent_sku
      const mpn =
        typeof product.metadata?.mpn === "string" ? product.metadata.mpn : null
      const sku = variantSku || String(parentSku || "") || mpn
      if (!isSkuLikeCatalogSlug(brand, product.handle, sku)) {
        continue
      }
      const catalogHandle =
        (variantSku
          ? bySku.get(`${brand}:${skuKey(variantSku)}`)
          : undefined) ||
        (parentSku
          ? bySku.get(`${brand}:${skuKey(String(parentSku))}`)
          : undefined) ||
        (mpn ? bySku.get(`${brand}:${skuKey(mpn)}`) : undefined)
      const categoryHint =
        typeof product.metadata?.category_hint === "string"
          ? product.metadata.category_hint
          : null
      const resolved = resolveSkuLikeProductHandle({
        manufacturerId: brand,
        sku,
        title: product.title,
        mpn,
        categoryHint,
        catalogHandle,
      })
      if (
        isSkuLikeCatalogSlug(brand, resolved, sku) ||
        resolved === product.handle
      ) {
        continue
      }
      const nextHandle = uniqueHandle(resolved, claimed)
      if (!nextHandle) {
        logger.warn(
          `[sku-handle] skip unresolved duplicate ${product.handle} -> ${resolved}`
        )
        continue
      }
      claimed.delete(product.handle.toLowerCase())
      updates.push({ id: product.id, from: product.handle, to: nextHandle })
    }
  }

  logger.info(`[sku-handle] changing=${updates.length}`)

  for (const item of updates) {
    await productModule.updateProducts(item.id, { handle: tempHandle(item.id) })
  }
  let done = 0
  for (const item of updates) {
    await productModule.updateProducts(item.id, { handle: item.to })
    done += 1
    if (done % 50 === 0 || done === updates.length) {
      logger.info(`[sku-handle] ${done}/${updates.length}`)
    }
  }

  for (const item of updates.slice(0, 12)) {
    logger.info(`[sku-handle] ${item.from} -> ${item.to}`)
  }

  logger.info(`[sku-handle] done updated=${updates.length}`)
}
