"use client"

import { type MegaMenuDefinition } from "@lib/mega-menu/config"
import { MEGA_MENU_LAYOUT } from "@lib/mega-menu/schema"
import MegaMenuColumnView from "./mega-menu-column"
import MegaMenuPanelShell from "./mega-menu-panel-shell"

type MegaMenuPanelProps = {
  menu: MegaMenuDefinition
  open: boolean
  onClose: () => void
}

const MegaMenuPanel = ({ menu, open, onClose }: MegaMenuPanelProps) => {
  const minHeight = menu.panelMinHeight ?? MEGA_MENU_LAYOUT.panelMinHeight
  const columnTemplate =
    menu.columnTemplate ??
    (menu.columns.length === 3
      ? MEGA_MENU_LAYOUT.triple
      : menu.columns.length === 2
        ? MEGA_MENU_LAYOUT.double
        : MEGA_MENU_LAYOUT.single)

  return (
    <MegaMenuPanelShell
      open={open}
      label={`${menu.label} menu`}
      testId={`mega-menu-panel-${menu.id}`}
    >
      <div
        className="grid gap-8 overflow-hidden"
        style={{
          gridTemplateColumns: columnTemplate,
          minHeight: `${minHeight}px`,
          maxHeight: `${MEGA_MENU_LAYOUT.panelMaxHeight}px`,
        }}
      >
        {menu.columns.map((column) => (
          <MegaMenuColumnView
            key={column.id}
            column={column}
            onClose={onClose}
          />
        ))}
      </div>
    </MegaMenuPanelShell>
  )
}

export default MegaMenuPanel
