"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type UseHoverIntentOptions = {
  openDelay?: number
  closeDelay?: number
  initiallyOpen?: boolean
}

/**
 * Debounced hover open/close — prevents flicker when moving between trigger and panel.
 * INS-style mega menus use ~80ms open / ~250ms close delays.
 */
export function useHoverIntent({
  openDelay = 80,
  closeDelay = 250,
  initiallyOpen = false,
}: UseHoverIntentOptions = {}) {
  const [active, setActive] = useState(initiallyOpen)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const open = useCallback(() => {
    clearTimers()
    setActive(true)
  }, [clearTimers])

  const close = useCallback(() => {
    clearTimers()
    setActive(false)
  }, [clearTimers])

  const onEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    if (active) return
    openTimer.current = setTimeout(() => setActive(true), openDelay)
  }, [active, openDelay])

  const onLeave = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current)
      openTimer.current = null
    }
    closeTimer.current = setTimeout(() => setActive(false), closeDelay)
  }, [closeDelay])

  useEffect(() => clearTimers, [clearTimers])

  return { active, open, close, onEnter, onLeave, setActive }
}
