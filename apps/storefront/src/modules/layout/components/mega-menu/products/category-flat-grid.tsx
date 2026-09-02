"use client"

import {
  categoryHref,
  type CategoryNode,
} from "@lib/mega-menu/catalog-nav"
import { splitIntoColumns } from "@lib/mega-menu/config"
import { MEGA_MENU_LAYOUT, MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoryFlatGridProps = {
  categories: CategoryNode[]
  onClose: () => void
}

const CategoryFlatGrid = ({ categories, onClose }: CategoryFlatGridProps) => {
  const columns = splitIntoColumns(categories, MEGA_MENU_LAYOUT.flatColumns)

  return (
    <div className="min-w-0 pl-8" data-testid="mega-menu-category-flat-grid">
      <h2 className={MEGA_MENU_TYPOGRAPHY.panelTitle}>Supercore Products</h2>

      {categories.length > 0 ? (
        <div
          className="mt-6 grid gap-x-10 gap-y-0"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column, columnIndex) => (
            <ul key={columnIndex} className="space-y-3">
              {column.map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={categoryHref(category.handle)}
                    onClick={onClose}
                    className={`block ${MEGA_MENU_TYPOGRAPHY.flatLink}`}
                    data-testid="mega-menu-category-link"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-sc-steel">No categories available.</p>
      )}

      <div className="mt-8 border-t border-sc-line pt-5">
        <LocalizedClientLink
          href="/store"
          onClick={onClose}
          className={MEGA_MENU_TYPOGRAPHY.viewAll}
        >
          View All Supercore Products
          <span aria-hidden>→</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default CategoryFlatGrid
