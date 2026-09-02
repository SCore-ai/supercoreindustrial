import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  splitColumnItems,
  type MegaMenuColumn,
} from "@lib/mega-menu/config"
import { MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"

type MegaMenuColumnProps = {
  column: MegaMenuColumn
  onClose: () => void
}

const LinkList = ({
  items,
  onClose,
}: {
  items: MegaMenuColumn["items"]
  onClose: () => void
}) => (
  <ul className="space-y-0.5">
    {items.map((item) => (
      <li key={item.href}>
        <LocalizedClientLink
          href={item.href}
          onClick={onClose}
          className={`block rounded px-1.5 py-1 transition-colors hover:bg-sc-paper hover:text-sc-ink ${MEGA_MENU_TYPOGRAPHY.link}`}
        >
          {item.label}
        </LocalizedClientLink>
      </li>
    ))}
  </ul>
)

const MegaMenuColumnView = ({ column, onClose }: MegaMenuColumnProps) => {
  const useTwoCol = column.layout === "dense-2col" && column.items.length > 8
  const [left, right] = useTwoCol ? splitColumnItems(column.items) : [column.items, []]

  return (
    <div className="min-w-0" data-testid={`mega-menu-column-${column.id}`}>
      {column.href ? (
        <LocalizedClientLink
          href={column.href}
          onClick={onClose}
          className={`${MEGA_MENU_TYPOGRAPHY.columnTitle} hover:text-sc-ink`}
        >
          {column.title}
        </LocalizedClientLink>
      ) : (
        <p className={MEGA_MENU_TYPOGRAPHY.columnTitle}>{column.title}</p>
      )}

      <div className="mt-3 border-t border-sc-line pt-3">
        {useTwoCol ? (
          <div className="grid grid-cols-2 gap-x-4">
            <LinkList items={left} onClose={onClose} />
            <LinkList items={right} onClose={onClose} />
          </div>
        ) : (
          <LinkList items={left} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

export default MegaMenuColumnView
