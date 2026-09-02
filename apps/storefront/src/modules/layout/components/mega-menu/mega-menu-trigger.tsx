"use client"

import MegaMenuChevron from "./mega-menu-chevron"
import { useMegaMenu } from "./mega-menu-context"

type MegaMenuTriggerProps = {
  id: string
  label: string
  testId?: string
}

/**
 * INS-style nav trigger: hover highlights only; click toggles the panel open.
 */
const MegaMenuTrigger = ({ id, label, testId }: MegaMenuTriggerProps) => {
  const { toggle, isOpen } = useMegaMenu()
  const active = isOpen(id)

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      className={`sc-mega-menu-trigger ${active ? "is-active" : ""}`}
      data-main-nav-link
      data-testid={testId}
      aria-expanded={active}
      aria-haspopup="true"
    >
      {label}
      <MegaMenuChevron active={active} />
    </button>
  )
}

export default MegaMenuTrigger
