"use client"

import { splitIntoColumns } from "@lib/mega-menu/config"
import { MEGA_MENU_LAYOUT, MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type ProductNavLink = {
  id: string
  label: string
  href: string
  featured?: boolean
  badgeLabel?: string
}

type ProductLinksFlatGridProps = {
  title: string
  subtitle?: string
  items: ProductNavLink[]
  viewAllHref: string
  viewAllLabel: string
  onClose: () => void
  testId?: string
  linkTestId?: string
}

const ProductLinksFlatGrid = ({
  title,
  subtitle,
  items,
  viewAllHref,
  viewAllLabel,
  onClose,
  testId,
  linkTestId,
}: ProductLinksFlatGridProps) => {
  const columns = splitIntoColumns(items, MEGA_MENU_LAYOUT.flatColumns)

  return (
    <div className="min-w-0 pl-8" data-testid={testId}>
      <h2 className={MEGA_MENU_TYPOGRAPHY.panelTitle}>{title}</h2>
      {subtitle && (
        <p className="mt-1 text-base text-sc-steel">{subtitle}</p>
      )}

      {items.length > 0 ? (
        <div
          className="mt-6 grid gap-x-10 gap-y-0"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column, columnIndex) => (
            <ul key={columnIndex} className="space-y-3">
              {column.map((item) => (
                <li key={item.id}>
                  <LocalizedClientLink
                    href={item.href}
                    onClick={onClose}
                    className={`block ${MEGA_MENU_TYPOGRAPHY.flatLink} ${
                      item.featured ? "font-semibold text-sc-ink" : ""
                    }`}
                    data-testid={linkTestId}
                  >
                    {item.label}
                    {item.badgeLabel ? (
                      <span className="ml-2 text-xs font-medium uppercase tracking-wide text-sc-signal">
                        {item.badgeLabel}
                      </span>
                    ) : null}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-base text-sc-steel">No items available.</p>
      )}

      <div className="mt-8 border-t border-sc-line pt-5">
        <LocalizedClientLink
          href={viewAllHref}
          onClick={onClose}
          className={MEGA_MENU_TYPOGRAPHY.viewAll}
        >
          {viewAllLabel}
          <span aria-hidden>→</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default ProductLinksFlatGrid
