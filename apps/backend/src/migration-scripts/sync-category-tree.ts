import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import {
  SUPERCORE_CATEGORY_TREE,
  type CategorySeed,
} from "../lib/seed/supercore-category-tree"

/** Idempotent sync — creates any category from the tree that is not already in the DB (by handle). */
export async function syncSupercoreCategoryTree(
  container: MedusaContainer,
  tree: CategorySeed[] = SUPERCORE_CATEGORY_TREE,
  parentId?: string,
  byHandle?: Map<string, string>
): Promise<Map<string, string>> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (!byHandle) {
    byHandle = new Map<string, string>()
    const { data } = await query.graph({
      entity: "product_category",
      fields: ["id", "handle"],
    })

    for (const category of data) {
      if (category.handle) {
        byHandle.set(category.handle, category.id)
      }
    }
  }

  for (const node of tree) {
    let categoryId = byHandle.get(node.handle)

    if (!categoryId) {
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [
            {
              name: node.name,
              handle: node.handle,
              is_active: true,
              ...(parentId ? { parent_category_id: parentId } : {}),
            },
          ],
        },
      })

      categoryId = result[0].id
      byHandle.set(node.handle, categoryId)
      logger.info(`  created category: ${node.name} (${node.handle})`)
    }

    if (node.children?.length) {
      await syncSupercoreCategoryTree(
        container,
        node.children,
        categoryId,
        byHandle
      )
    }
  }

  return byHandle
}

export default async function sync_category_tree({
  container,
}: {
  container: MedusaContainer
}) {
  await syncSupercoreCategoryTree(container)
}
