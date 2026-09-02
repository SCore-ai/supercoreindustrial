"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { splitIntoColumns, type MegaMenuColumn } from "@lib/mega-menu/config"
import { MEGA_MENU_LAYOUT, MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"

type SectionFlatGridProps = {
  title: string
  href?: string
  items: MegaMenuColumn["items"]
  viewAllHref: string
  viewAllLabel: string
  onClose: () => void
  inset?: boolean
}

const SectionFlatGrid = ({
  title,
  href,
  items,
  viewAllHref,
  viewAllLabel,
  onClose,
  inset = true,
}: SectionFlatGridProps) => {
  const columns = splitIntoColumns(items, MEGA_MENU_LAYOUT.flatColumns)

  return (
    <div
      className={`min-w-0 ${inset ? "pl-8" : ""}`}
      data-testid="mega-menu-section-flat-grid"
    >
      {href ? (
        <LocalizedClientLink
          href={href}
          onClick={onClose}
          className={MEGA_MENU_TYPOGRAPHY.panelTitle}
        >
          {title}
        </LocalizedClientLink>
      ) : (
        <h2 className={MEGA_MENU_TYPOGRAPHY.panelTitle}>{title}</h2>
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
                <li key={item.href}>
                  <LocalizedClientLink
                    href={item.href}
                    onClick={onClose}
                    className={`block ${MEGA_MENU_TYPOGRAPHY.flatLink}`}
                  >
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-base text-sc-steel">No links available.</p>
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

export default SectionFlatGrid
