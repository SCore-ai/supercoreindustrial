"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { revalidateTag } from "next/cache"
import { getOrSetCart } from "./cart"
import { getAuthHeaders, getCacheTag } from "./cookies"

export type QuickOrderFailure = {
  line?: number
  sku?: string
  quantity?: number
  reason: string
}

export async function lookupQuickOrderSkus(
  rows: Array<{ sku: string; quantity: number }>
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{
      items: Array<{ sku: string; title?: string | null; variant_id: string }>
      failures: QuickOrderFailure[]
    }>("/store/b2b/quick-order/lookup", {
      method: "POST",
      body: { rows },
      headers,
      cache: "no-store",
    })
    .catch(() => ({ items: [], failures: [] }))
}

export async function bulkAddToCart({
  countryCode,
  rows,
  csv,
}: {
  countryCode: string
  rows?: Array<{ sku: string; quantity: number }>
  csv?: string
}) {
  if (!rows?.length && !csv?.trim()) {
    throw new Error("Enter at least one stock number or paste BOM lines")
  }

  const cart = await getOrSetCart(countryCode)

  if (!cart) {
    throw new Error("Error retrieving or creating cart")
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.client
    .fetch<{
      added_count: number
      parse_failures: QuickOrderFailure[]
      resolution_failures: QuickOrderFailure[]
    }>("/store/b2b/quick-order/add-to-cart", {
      method: "POST",
      body: {
        cart_id: cart.id,
        rows,
        csv,
      },
      headers,
    })
    .catch(medusaError)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  return {
    added_count: response.added_count,
    parse_failures: response.parse_failures ?? [],
    resolution_failures: response.resolution_failures ?? [],
  }
}
