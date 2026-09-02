import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  ensureProductsCollection,
  getTypesenseClient,
  PRODUCTS_COLLECTION,
} from "../lib/typesense-client"

function readManufacturer(product: Record<string, unknown>) {
  const metadata = (product.metadata as Record<string, unknown> | undefined) ?? {}
  const fromMetadata =
    metadata.manufacturer ??
    metadata.manufacturer_name ??
    metadata.brand ??
    metadata.manufacturer_id

  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim()
  }

  const collections = (product.collections as Array<{ title?: string }> | undefined) ?? []
  const collectionTitle = collections[0]?.title
  return collectionTitle?.trim() || null
}

function readMinPrice(variants: any[], currencyCode = "gbp") {
  let min: number | null = null
  const currency = currencyCode.toLowerCase()

  for (const variant of variants) {
    for (const price of variant.prices || []) {
      if (String(price.currency_code ?? "").toLowerCase() !== currency) {
        continue
      }
      const amount = Number(price.amount)
      if (!Number.isFinite(amount) || amount <= 0) {
        continue
      }
      min = min === null ? amount : Math.min(min, amount)
    }
  }

  return min
}

function readMinPricesByCurrency(variants: any[]) {
  return {
    gbp: readMinPrice(variants, "gbp"),
    eur: readMinPrice(variants, "eur"),
    usd: readMinPrice(variants, "usd"),
  }
}

function readInStock(variants: any[]) {
  if (!variants.length) {
    return false
  }

  return variants.some((variant) => {
    if (typeof variant.manage_inventory === "boolean" && !variant.manage_inventory) {
      return true
    }

    if (typeof variant.inventory_quantity === "number") {
      return variant.inventory_quantity > 0
    }

    return true
  })
}

export default async function productSearchIndexHandler({
  event: { name, data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const client = getTypesenseClient()

  try {
    await ensureProductsCollection()
  } catch (err: any) {
    logger.warn(`[typesense] collection not reachable, skipping index: ${err?.message}`)
    return
  }

  if (name === "product.deleted") {
    try {
      await client.collections(PRODUCTS_COLLECTION).documents(data.id).delete()
    } catch (err: any) {
      logger.warn(`[typesense] delete failed for ${data.id}: ${err?.message}`)
    }
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [product],
  } = await query.graph({
    entity: "product",
    filters: { id: data.id },
    fields: [
      "id",
      "title",
      "handle",
      "description",
      "thumbnail",
      "status",
      "metadata",
      "categories.name",
      "collections.title",
      "variants.sku",
      "variants.metadata",
      "variants.manage_inventory",
      "variants.inventory_quantity",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.options.value",
      "variants.options.option.title",
    ],
  })

  if (!product) {
    return
  }

  const variants = (product.variants as any[]) || []
  const sku = variants.map((variant) => variant.sku).filter(Boolean)
  const mpn = variants
    .map((variant) => variant.metadata?.mpn)
    .filter((value): value is string => typeof value === "string" && value.length > 0)

  const certification = Array.from(
    new Set(
      variants
        .flatMap((variant) => variant.options || [])
        .filter((option: any) => option?.option?.title === "Certification")
        .map((option: any) => option.value)
        .filter(Boolean)
    )
  )

  const prices = readMinPricesByCurrency(variants)
  const priceFrom = prices.gbp ?? prices.eur ?? prices.usd
  const hasPrice = priceFrom !== null
  const manufacturer = readManufacturer(product as Record<string, unknown>)

  const doc: Record<string, unknown> = {
    id: product.id,
    title: product.title || "",
    title_sort: (product.title || "").toLowerCase(),
    handle: product.handle || "",
    description: product.description || "",
    thumbnail: product.thumbnail || "",
    sku,
    mpn,
    category: (product.categories || []).map((category: any) => category.name),
    certification,
    has_price: hasPrice,
    in_stock: readInStock(variants),
    status: product.status || "draft",
  }

  if (manufacturer) {
    doc.manufacturer = manufacturer
  }

  if (hasPrice && priceFrom !== null) {
    doc.price_from = priceFrom
  }
  if (prices.gbp !== null) {
    doc.price_from_gbp = prices.gbp
  }
  if (prices.eur !== null) {
    doc.price_from_eur = prices.eur
  }
  if (prices.usd !== null) {
    doc.price_from_usd = prices.usd
  }

  try {
    await client.collections(PRODUCTS_COLLECTION).documents().upsert(doc as any)
  } catch (err: any) {
    logger.warn(`[typesense] index upsert failed for ${product.id}: ${err?.message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
