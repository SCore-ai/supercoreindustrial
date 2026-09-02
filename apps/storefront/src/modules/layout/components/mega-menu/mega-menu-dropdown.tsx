"use client"

import { type MegaMenuDefinition } from "@lib/mega-menu/config"
import MegaMenuPanel from "./mega-menu-panel"
import { useMegaMenu } from "./mega-menu-context"
import MegaMenuTrigger from "./mega-menu-trigger"

type MegaMenuDropdownProps = {
  menu: MegaMenuDefinition
}

const MegaMenuDropdown = ({ menu }: MegaMenuDropdownProps) => {
  const { close, isOpen } = useMegaMenu()
  const active = isOpen(menu.id)

  return (
    <div className="relative h-full">
      <MegaMenuTrigger
        id={menu.id}
        label={menu.label}
        testId={`mega-menu-trigger-${menu.id}`}
      />

      <MegaMenuPanel menu={menu} open={active} onClose={close} />
    </div>
  )
}

export default MegaMenuDropdown
