import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { OnlineStoreNavLink } from "./types"

export type CatalogNavLink = {
  label: string
  href: string
  handle?: string
}

export type CatalogNavSection = {
  id: "supercore" | "partner" | "brands"
  title: string
  items: CatalogNavLink[]
  editable?: boolean
}

export type ProductsMenuPreview = {
  label: string
  sections: CatalogNavSection[]
  category_count: number
  collection_count: number
}

type ScopeLike = {
  resolve: (key: string) => {
    graph: (args: Record<string, unknown>) => Promise<{ data: Record<string, unknown>[] }>
  }
}

export async function getProductsMenuPreview(
  scope: ScopeLike,
  partnerCatalog: OnlineStoreNavLink[]
): Promise<ProductsMenuPreview> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)

  const [{ data: categories }, { data: collections }] = await Promise.all([
    query.graph({
      entity: "product_category",
      fields: ["id", "name", "handle", "rank", "parent_category_id"],
      filters: { parent_category_id: null },
      pagination: { take: 100 },
    }),
    query.graph({
      entity: "product_collection",
      fields: ["id", "title", "handle"],
      pagination: { take: 100 },
    }),
  ])

  const sortedCategories = [...categories].sort((a, b) => {
    const rankA = typeof a.rank === "number" ? a.rank : 0
    const rankB = typeof b.rank === "number" ? b.rank : 0
    const nameA = String(a.name ?? "")
    const nameB = String(b.name ?? "")
    return rankA - rankB || nameA.localeCompare(nameB)
  })

  const sortedCollections = [...collections]
    .filter((collection) => String(collection.handle ?? "") !== "tecnovideo")
    .sort((a, b) => {
      const order = ["spectrum", "axis", "zenitel"]
      const aRank = order.indexOf(String(a.handle ?? ""))
      const bRank = order.indexOf(String(b.handle ?? ""))
      const aOrder = aRank === -1 ? 100 : aRank
      const bOrder = bRank === -1 ? 100 : bRank
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      return String(a.title ?? "").localeCompare(String(b.title ?? ""))
    })

  return {
    label: "Products",
    category_count: sortedCategories.length,
    collection_count: sortedCollections.length,
    sections: [
      {
        id: "supercore",
        title: "Supercore Products",
        editable: false,
        items: sortedCategories.map((category) => ({
          label: String(category.name ?? category.handle ?? "Category"),
          href: `/categories/${String(category.handle ?? "")}`,
          handle: String(category.handle ?? ""),
        })),
      },
      {
        id: "partner",
        title: "Partner Catalogue",
        editable: true,
        items: partnerCatalog.map((item) => ({
          label: item.label,
          href: item.href,
        })),
      },
      {
        id: "brands",
        title: "Shop by Brand",
        editable: false,
        items: sortedCollections.map((collection) => {
          const handle = String(collection.handle ?? "")
          const hub =
            handle === "spectrum" || handle === "axis" || handle === "zenitel"
              ? `/brands/${handle}`
              : `/collections/${handle}`

          return {
            label: String(collection.title ?? handle ?? "Collection"),
            href: hub,
            handle,
          }
        }),
      },
    ],
  }
}
