"use server"

import { getCollectionByHandle } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export async function listCollectionCatalog({
  handle,
  countryCode,
  limit = 100,
}: {
  handle: string
  countryCode: string
  limit?: number
}): Promise<{
  collection: HttpTypes.StoreCollection | null
  products: HttpTypes.StoreProduct[]
}> {
  const collection = await getCollectionByHandle(handle)

  if (!collection?.id) {
    return { collection: null, products: [] }
  }

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      collection_id: [collection.id],
      limit,
    },
  })

  return {
    collection,
    products: products ?? [],
  }
}
