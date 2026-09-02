"use client"

import { ArrowRightMini } from "@medusajs/icons"
import { MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"

export type CatalogViewMode = "supercore" | "partner" | "brands"

type CatalogModeRailProps = {
  mode: CatalogViewMode
  onModeChange: (mode: CatalogViewMode) => void
}

const SupercoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 9h16M9 4v16" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const PartnerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
    <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const BrandIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
    <path
      d="M12 2l2.4 4.8L20 8l-4 3.9L17 18l-5-2.6L7 18l1-6.1L4 8l5.6-1.2L12 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const modes: {
  id: CatalogViewMode
  label: string
  icon: typeof SupercoreIcon
}[] = [
  { id: "supercore", label: "Supercore Products", icon: SupercoreIcon },
  { id: "partner", label: "Partner Catalogue", icon: PartnerIcon },
  { id: "brands", label: "Shop by Brand", icon: BrandIcon },
]

const CatalogModeRail = ({ mode, onModeChange }: CatalogModeRailProps) => (
  <nav
    aria-label="Products catalogue sections"
    className="border-r border-sc-line pr-0"
    data-testid="mega-menu-mode-rail"
  >
    <ul className="flex flex-col gap-1">
      {modes.map(({ id, label, icon: Icon }) => {
        const isActive = mode === id

        return (
          <li key={id}>
            <button
              type="button"
              onMouseEnter={() => onModeChange(id)}
              onFocus={() => onModeChange(id)}
              onClick={() => onModeChange(id)}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3.5 text-left transition-colors ${
                isActive
                  ? "bg-sc-cta/10 text-sc-ink font-medium"
                  : "text-sc-body hover:bg-sc-paper hover:text-sc-ink"
              }`}
              aria-current={isActive ? "true" : undefined}
              data-testid={`mega-menu-mode-${id}`}
            >
              <Icon />
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

export default CatalogModeRail
