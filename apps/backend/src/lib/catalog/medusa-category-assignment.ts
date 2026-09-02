import fs from "fs"
import path from "path"
import {
  SUPERCORE_CATEGORY_TREE,
  type CategorySeed,
} from "../seed/supercore-category-tree"

/** Max category depth assigned in Medusa (0 = root only, 1 = direct child). */
export const MEDUSA_CATEGORY_MAX_DEPTH = 1

export type CategoryHandleMeta = {
  handle: string
  parentHandle: string | null
  depth: number
}

export function buildCategoryHandleIndex(
  tree: CategorySeed[] = SUPERCORE_CATEGORY_TREE,
  parentHandle: string | null = null,
  depth = 0,
  acc: Map<string, CategoryHandleMeta> = new Map()
): Map<string, CategoryHandleMeta> {
  for (const node of tree) {
    acc.set(node.handle, {
      handle: node.handle,
      parentHandle,
      depth,
    })
    if (node.children?.length) {
      buildCategoryHandleIndex(node.children, node.handle, depth + 1, acc)
    }
  }
  return acc
}

/**
 * Collapse a website leaf handle to the shallowest Medusa assignment handle.
 * Folder taxonomy can stay detailed; Medusa product links stay broad for now.
 */
export function medusaCategoryHandle(
  leafHandle: string | null | undefined,
  maxDepth: number = MEDUSA_CATEGORY_MAX_DEPTH,
  index?: Map<string, CategoryHandleMeta>
): string | null {
  const handle = String(leafHandle ?? "").trim()
  if (!handle || handle === "_unmapped") {
    return null
  }

  const idx = index ?? buildCategoryHandleIndex()
  let current = handle

  while (true) {
    const meta = idx.get(current)
    if (!meta) {
      return handle
    }
    if (meta.depth <= maxDepth) {
      return current
    }
    if (!meta.parentHandle) {
      return current
    }
    current = meta.parentHandle
  }
}

export type WebsiteCategoryIndex = Map<string, string>

export function loadWebsiteCategoryIndex(
  productsRoot = path.resolve(
    process.cwd(),
    "data/website sources/Products"
  )
): WebsiteCategoryIndex {
  const indexFile = path.join(productsRoot, "_index.json")
  const map: WebsiteCategoryIndex = new Map()

  if (fs.existsSync(indexFile)) {
    const json = JSON.parse(fs.readFileSync(indexFile, "utf8")) as {
      products?: Array<{ slug?: string; category_handle?: string }>
    }
    for (const product of json.products ?? []) {
      if (product.slug && product.category_handle) {
        map.set(product.slug, product.category_handle)
      }
    }
  }

  return map
}

export function resolveWebsiteCategoryHandle(
  productHandle: string,
  websiteIndex: WebsiteCategoryIndex
): string | null {
  const handle = String(productHandle ?? "").trim()
  if (!handle) {
    return null
  }
  return websiteIndex.get(handle) ?? null
}
