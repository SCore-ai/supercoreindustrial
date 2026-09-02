"use client"

import {
  addRecentSearch,
  getRecentSearches,
  OPEN_SEARCH_EVENT,
} from "@lib/search/recent-searches"
import SearchAutocompletePanel from "@modules/search/components/search-autocomplete-panel"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

const SEARCH_EXPAND_MS = 1500

type SearchBarProps = {
  expanded?: boolean
  onExpand?: () => void
  onClose?: () => void
  popularSearches?: string[]
}

const SearchBar = ({
  expanded = false,
  onExpand,
  onClose,
  popularSearches = [],
}: SearchBarProps) => {
  const router = useRouter()
  const { countryCode } = useParams()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLFormElement>(null)

  const [q, setQ] = useState(searchParams.get("q") || "")
  const [mpnOnly, setMpnOnly] = useState(searchParams.get("mpn_only") === "true")
  const [panelOpen, setPanelOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const navigateToSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim()
      if (!trimmed) {
        return
      }

      addRecentSearch(trimmed)
      setRecentSearches(getRecentSearches())

      const params = new URLSearchParams()
      params.set("q", trimmed)
      if (mpnOnly) {
        params.set("mpn_only", "true")
      }

      setPanelOpen(false)
      router.push(`/${countryCode}/search?${params.toString()}`)
    },
    [countryCode, mpnOnly, router]
  )

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    if (!expanded) {
      return
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
      setPanelOpen(true)
    }, SEARCH_EXPAND_MS)

    return () => window.clearTimeout(timer)
  }, [expanded])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false)
        onClose?.()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  useEffect(() => {
    const onOpenSearch = () => {
      onExpand?.()
      window.setTimeout(() => {
        inputRef.current?.focus()
        setPanelOpen(true)
      }, 100)
    }

    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearch)
    return () => window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearch)
  }, [onExpand])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false)
      }
    }

    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    navigateToSearch(q)
  }

  const handleClose = () => {
    setPanelOpen(false)
    inputRef.current?.blur()
    onClose?.()
  }

  const handleFocus = () => {
    setPanelOpen(true)
    if (!expanded) {
      onExpand?.()
    }
  }

  const handleActivate = () => {
    setPanelOpen(true)
    if (!expanded) {
      onExpand?.()
    }
  }

  return (
    <form
      ref={rootRef}
      onSubmit={submit}
      className="relative flex w-full min-w-0 items-center gap-x-3"
      data-testid={expanded ? "search-form-expanded" : "search-form-compact"}
    >
      <div
        className={`sc-search-expand-track border transition-[border-color] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "is-expanded border-sc-steel" : "border-sc-line"
        }`}
        style={{ transitionDuration: "var(--sc-search-expand-duration)" }}
        onClick={handleActivate}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-sc-steel/60"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(event) => {
            setQ(event.target.value)
            setPanelOpen(true)
          }}
          onFocus={handleFocus}
          placeholder="Search Part Number, Keyword..."
          className="sc-search-input"
          data-testid="search-input"
          aria-expanded={panelOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        <button
          type="button"
          onClick={handleClose}
          className="sc-search-close-btn absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-sc-steel hover:bg-sc-paper hover:text-sc-ink"
          aria-label="Close search"
          data-testid="search-close-button"
          tabIndex={expanded ? 0 : -1}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <label className="sc-search-mpn-toggle flex items-center gap-x-2 text-base text-sc-steel cursor-pointer select-none">
        <input
          type="checkbox"
          checked={mpnOnly}
          onChange={(event) => setMpnOnly(event.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-sc-line"
          data-testid="mpn-only-toggle"
        />
        MPN only
      </label>

      <SearchAutocompletePanel
        query={q}
        mpnOnly={mpnOnly}
        open={panelOpen && (expanded || q.trim().length > 0)}
        recentSearches={recentSearches}
        popularSearches={popularSearches}
        onSelectQuery={(query) => {
          setQ(query)
          navigateToSearch(query)
        }}
        onViewAll={() => navigateToSearch(q)}
      />
    </form>
  )
}

export default SearchBar
