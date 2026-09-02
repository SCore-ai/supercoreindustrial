"use client"

import { ArrowRightMini } from "@medusajs/icons"
import { MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"

type SectionRailItem = {
  id: string
  label: string
}

type SectionRailProps = {
  sections: SectionRailItem[]
  activeId: string
  onSelect: (id: string) => void
}

const SectionRail = ({ sections, activeId, onSelect }: SectionRailProps) => (
  <nav
    aria-label="Menu sections"
    className="border-r border-sc-line pr-0"
    data-testid="mega-menu-section-rail"
  >
    <ul className="flex flex-col gap-1">
      {sections.map(({ id, label }) => {
        const isActive = id === activeId

        return (
          <li key={id}>
            <button
              type="button"
              onMouseEnter={() => onSelect(id)}
              onFocus={() => onSelect(id)}
              onClick={() => onSelect(id)}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3.5 text-left transition-colors ${
                isActive
                  ? "bg-sc-cta/10 text-sc-ink font-medium"
                  : "text-sc-body hover:bg-sc-paper hover:text-sc-ink"
              }`}
              aria-current={isActive ? "true" : undefined}
              data-testid={`mega-menu-section-${id}`}
            >
              <span className={`flex-1 ${MEGA_MENU_TYPOGRAPHY.modeRailLabel}`}>
                {label}
              </span>
              <ArrowRightMini
                className={`h-4 w-4 shrink-0 ${isActive ? "opacity-80" : "opacity-40"}`}
              />
            </button>
          </li>
        )
      })}
    </ul>
  </nav>
)

export default SectionRail
