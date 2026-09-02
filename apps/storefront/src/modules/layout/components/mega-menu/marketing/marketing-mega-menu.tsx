"use client"

import { useState } from "react"

import { type MegaMenuDefinition } from "@lib/mega-menu/config"
import { MEGA_MENU_LAYOUT } from "@lib/mega-menu/schema"
import MegaMenuContentPane from "../mega-menu-content-pane"
import { useMegaMenu } from "../mega-menu-context"
import MegaMenuPanelShell from "../mega-menu-panel-shell"
import MegaMenuTrigger from "../mega-menu-trigger"
import SectionRail from "./section-rail"
import SectionFlatGrid from "./section-flat-grid"

type MarketingMegaMenuProps = {
  menu: MegaMenuDefinition
}

const MarketingMegaMenu = ({ menu }: MarketingMegaMenuProps) => {
  const { close, isOpen } = useMegaMenu()
  const active = isOpen(menu.id)

  const [activeSectionId, setActiveSectionId] = useState(menu.columns[0]?.id ?? "")

  const activeColumn =
    menu.columns.find((column) => column.id === activeSectionId) ?? menu.columns[0]

  const useSectionRail = menu.columns.length > 1
  const hubHref = menu.href ?? activeColumn?.href ?? "#"
  const panelTitle = useSectionRail
    ? activeColumn?.title ?? menu.label
    : menu.columns[0]?.title ?? menu.label

  const allItems = menu.columns.flatMap((column) => column.items)
  const flatItems = useSectionRail ? activeColumn?.items ?? [] : allItems

  return (
    <div className="relative flex h-full items-stretch">
      <MegaMenuTrigger
        id={menu.id}
        label={menu.label}
        testId={`mega-menu-trigger-${menu.id}`}
      />

      <MegaMenuPanelShell
        open={active}
        label={`${menu.label} menu`}
        testId={`mega-menu-panel-${menu.id}`}
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: useSectionRail
              ? MEGA_MENU_LAYOUT.productsGrid
              : "minmax(0, 1fr)",
            minHeight: `${MEGA_MENU_LAYOUT.panelMinHeight}px`,
            maxHeight: `${MEGA_MENU_LAYOUT.panelMaxHeight}px`,
          }}
        >
          {useSectionRail && (
            <SectionRail
              sections={menu.columns.map((column) => ({
                id: column.id,
                label: column.title,
              }))}
              activeId={activeSectionId}
              onSelect={setActiveSectionId}
            />
          )}

          <MegaMenuContentPane paneKey={activeSectionId}>
            <SectionFlatGrid
              title={panelTitle}
              href={activeColumn?.href}
              items={flatItems}
              viewAllHref={hubHref}
              viewAllLabel={`View All ${menu.label}`}
              onClose={close}
              inset={useSectionRail}
            />
          </MegaMenuContentPane>
        </div>
      </MegaMenuPanelShell>
    </div>
  )
}

export default MarketingMegaMenu
