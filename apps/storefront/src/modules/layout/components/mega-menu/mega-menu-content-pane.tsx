"use client"

import type { ReactNode } from "react"

type MegaMenuContentPaneProps = {
  paneKey: string
  children: ReactNode
  className?: string
}

/** INS-style crossfade when switching left-rail sections or product modes. */
const MegaMenuContentPane = ({
  paneKey,
  children,
  className = "",
}: MegaMenuContentPaneProps) => (
  <div
    key={paneKey}
    className={`sc-mega-menu-content-pane min-w-0 ${className}`}
  >
    {children}
  </div>
)

export default MegaMenuContentPane
