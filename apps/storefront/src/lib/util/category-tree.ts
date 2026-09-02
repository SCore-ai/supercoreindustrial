import { HttpTypes } from "@medusajs/types"

export type CategoryNode = HttpTypes.StoreProductCategory

/** Discontinued catalog — searchable, not a shopping mega-menu root. */
export const LEGACY_DEVICES_HANDLE = "legacy-devices"

export function isShoppingCategory(category: { handle?: string | null }) {
  return category.handle !== LEGACY_DEVICES_HANDLE
}

/**
 * Categories flagged `metadata.featured` (set in the admin) win; falls back
 * to the first `limit` roots by rank so the menu is never empty before
 * anyone curates featured categories.
 */
export const getFeaturedCategories = (
  roots: CategoryNode[],
  limit = 6
): CategoryNode[] => {
  const shopping = roots.filter(isShoppingCategory)
  const flagged = shopping.filter((c) => c.metadata?.featured === true || c.metadata?.featured === "true")
  const source = flagged.length > 0 ? flagged : shopping
  return source.slice(0, limit)
}

export const findCategoryByHandle = (
  roots: CategoryNode[],
  handle: string
): CategoryNode | undefined => {
  for (const node of roots) {
    if (node.handle === handle) return node
    const nested = findCategoryByHandle(node.category_children ?? [], handle)
    if (nested) return nested
  }
  return undefined
}

/**
 * Root categories carrying `metadata.solution` (or the conventional
 * "Solution Platforms" node, matched by handle as a fallback for stores that
 * haven't tagged metadata yet) become the mega menu's Solutions column.
 */
export const getSolutionCategories = (
  roots: CategoryNode[],
  fallbackHandle = "solution-platforms"
): CategoryNode[] => {
  const flagged = roots.filter(
    (c) => c.metadata?.solution === true || c.metadata?.solution === "true"
  )
  if (flagged.length > 0) return flagged

  const fallback = roots.find((c) => c.handle === fallbackHandle)
  return fallback?.category_children?.length ? fallback.category_children : []
}
