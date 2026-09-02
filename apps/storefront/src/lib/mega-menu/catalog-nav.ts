import { HttpTypes } from "@medusajs/types"
import { getNavBrands } from "@lib/brands"
import {
  getFeaturedCategories,
  getSolutionCategories,
  isShoppingCategory,
  type CategoryNode,
} from "@lib/util/category-tree"

export type { CategoryNode }

export type ManufacturerLink = {
  id: string
  title: string
  handle: string
  href: string
  featured?: boolean
  badgeLabel?: string
}

/** Medusa-sourced catalog navigation — no hard-coded category lists */
export type CatalogNavData = {
  tree: CategoryNode[]
  featured: CategoryNode[]
  solutions: CategoryNode[]
  manufacturers: ManufacturerLink[]
}

export function buildCatalogNav(
  tree: CategoryNode[],
  collections: HttpTypes.StoreCollection[]
): CatalogNavData {
  const sortedTree = [...tree].sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name)
  )

  return {
    tree: sortedTree.filter(isShoppingCategory),
    featured: getFeaturedCategories(sortedTree),
    solutions: getSolutionCategories(sortedTree),
    manufacturers: navManufacturerLinks(collections),
  }
}

export function categoryHref(handle: string) {
  return `/categories/${handle}`
}

export function collectionHref(handle: string) {
  return `/collections/${handle}`
}

function navManufacturerLinks(
  collections: HttpTypes.StoreCollection[]
): ManufacturerLink[] {
  const byHandle = new Map(
    collections.map((collection) => [collection.handle, collection])
  )

  return getNavBrands().map((brand) => {
    const collection = byHandle.get(brand.collectionHandle)

    return {
      id: collection?.id ?? brand.id,
      title: brand.label,
      handle: brand.collectionHandle,
      href: brand.href,
      featured: brand.featured,
      badgeLabel: brand.badgeLabel,
    }
  })
}

/** Root categories shown in the INS-style flat "Categories" grid. */
export function getCatalogMenuCategories(tree: CategoryNode[]): CategoryNode[] {
  return tree.filter(isShoppingCategory).sort(
    (a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name)
  )
}
