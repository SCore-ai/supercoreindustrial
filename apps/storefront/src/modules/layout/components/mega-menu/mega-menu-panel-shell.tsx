"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import { MEGA_MENU_LAYOUT } from "@lib/mega-menu/schema"

type MegaMenuPanelShellProps = {
  open: boolean
  label: string
  testId?: string
  children: ReactNode
}

/**
 * Full-bleed mega menu panel aligned to the viewport (not the narrow trigger).
 * INS-style slide-down + fade (translateY -2rem → 0, 300ms ease-out).
 */
const MegaMenuPanelShell = ({
  open,
  label,
  testId,
  children,
}: MegaMenuPanelShellProps) => {
  const [top, setTop] = useState(0)
  const [shouldRender, setShouldRender] = useState(open)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    const timer = window.setTimeout(
      () => setShouldRender(false),
      MEGA_MENU_LAYOUT.panelTransitionMs
    )
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!shouldRender) {
      return
    }

    const syncTop = () => {
      const header = document.querySelector("[data-site-header]")
      if (header) {
        setTop(header.getBoundingClientRect().bottom)
      }
    }

    syncTop()
    window.addEventListener("scroll", syncTop, { passive: true })
    window.addEventListener("resize", syncTop)

    return () => {
      window.removeEventListener("scroll", syncTop)
      window.removeEventListener("resize", syncTop)
    }
  }, [shouldRender])

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={`sc-mega-menu-panel fixed inset-x-0 z-50 border-b border-sc-line bg-white shadow-[0_12px_40px_rgba(10,22,40,0.12)] ${
        isVisible ? "is-visible" : ""
      }`}
      style={{ top }}
      data-testid={testId}
      role="region"
      aria-label={label}
      aria-hidden={!isVisible}
    >
      <div className="content-container py-8 mega-menu-panel-scroll">{children}</div>
    </div>
  )
}

export default MegaMenuPanelShell
