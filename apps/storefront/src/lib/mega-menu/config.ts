import type { NavMenu } from "@lib/site-navigation"
import { MAIN_NAV } from "@lib/site-navigation"
import { MEGA_MENU_LAYOUT } from "./schema"

export type MegaMenuColumnLayout = "single" | "dense-2col"

export type MegaMenuColumn = {
  id: string
  title: string
  href?: string
  items: { label: string; href: string }[]
  layout?: MegaMenuColumnLayout
}

export type MegaMenuDefinition = {
  id: string
  label: string
  href?: string
  columns: MegaMenuColumn[]
  panelMinHeight?: number
  columnTemplate?: string
}

export function splitColumnItems<T>(items: T[]): [T[], T[]] {
  const midpoint = Math.ceil(items.length / 2)
  return [items.slice(0, midpoint), items.slice(midpoint)]
}

/** Split a flat list into N columns (INS-style mega menu grids). */
export function splitIntoColumns<T>(items: T[], columnCount: number): T[][] {
  if (columnCount <= 1 || items.length === 0) {
    return [items]
  }

  const columns: T[][] = Array.from({ length: columnCount }, () => [])
  const perColumn = Math.ceil(items.length / columnCount)

  items.forEach((item, index) => {
    columns[Math.floor(index / perColumn)]?.push(item)
  })

  return columns.filter((col) => col.length > 0)
}

function navMenuToMegaMenu(menu: NavMenu, id: string): MegaMenuDefinition {
  const columnTemplate =
    menu.columns?.length === 3
      ? MEGA_MENU_LAYOUT.triple
      : menu.columns?.length === 2
        ? MEGA_MENU_LAYOUT.double
        : MEGA_MENU_LAYOUT.single

  return {
    id,
    label: menu.label,
    href: menu.href,
    panelMinHeight: MEGA_MENU_LAYOUT.panelMinHeight,
    columnTemplate,
    columns: (menu.columns ?? []).map((column, index) => ({
      id: `${id}-col-${index}`,
      title: column.title,
      href: column.href,
      items: column.items,
      layout: column.items.length > 12 ? "dense-2col" : "single",
    })),
  }
}

export function buildMarketingMegaMenus(
  mainNavigation?: NavMenu[]
): MegaMenuDefinition[] {
  const source = mainNavigation ?? MAIN_NAV
  return source
    .filter((menu) => menu.label !== "Support")
    .map((menu) =>
      navMenuToMegaMenu(menu, menu.label.toLowerCase().replace(/\s+/g, "-"))
    )
}

export function buildSupportMegaMenu(mainNavigation?: NavMenu[]): MegaMenuDefinition {
  const source = mainNavigation ?? MAIN_NAV
  const support =
    source.find((menu) => menu.label === "Support") ??
    MAIN_NAV.find((menu) => menu.label === "Support")!
  return navMenuToMegaMenu(support, "support")
}

/** @deprecated Use buildMarketingMegaMenus() */
export const MARKETING_MEGA_MENUS: MegaMenuDefinition[] = buildMarketingMegaMenus()

/** @deprecated Use buildSupportMegaMenu() */
export const SUPPORT_MEGA_MENU: MegaMenuDefinition = buildSupportMegaMenu()
