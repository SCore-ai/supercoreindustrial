import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

/**
 * Root categories with their full descendant tree nested in `category_children`,
 * as returned natively by the Store API (no client-side tree reconstruction).
 * This is the source of truth for the product mega menu — never hand-maintain
 * a parallel category list for navigation.
 */
export const listCategoryTree = async (): Promise<
  HttpTypes.StoreProductCategory[]
> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  // Medusa v2.18 store API rejects is_active / is_internal query params.
  // Only pass supported filters here.
  const query = {
    fields: "id,name,handle,description,rank,metadata,category_children",
    parent_category_id: "null",
    include_descendants_tree: "true",
    limit: "100",
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query,
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) =>
      [...product_categories].sort(
        (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name)
      )
    )
    .catch((error) => {
      console.error("Failed to load category tree for mega menu:", error)
      return []
    })
}

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
