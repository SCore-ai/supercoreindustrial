"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

type MegaMenuContextValue = {
  openId: string | null
  toggle: (id: string) => void
  close: () => void
  isOpen: (id: string) => boolean
}

const MegaMenuContext = createContext<MegaMenuContextValue | null>(null)

export function MegaMenuProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpenId(null), [])

  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }, [])

  const isOpen = useCallback((id: string) => openId === id, [openId])

  useEffect(() => {
    if (!openId) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [openId, close])

  useEffect(() => {
    if (!openId) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) {
        close()
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [openId, close])

  return (
    <MegaMenuContext.Provider value={{ openId, toggle, close, isOpen }}>
      <div
        ref={rootRef}
        className="flex min-w-0 items-stretch pl-2"
        data-navigation
      >
        {children}
      </div>
    </MegaMenuContext.Provider>
  )
}

export function useMegaMenu() {
  const context = useContext(MegaMenuContext)

  if (!context) {
    throw new Error("useMegaMenu must be used within MegaMenuProvider")
  }

  return context
}
