const STORAGE_KEY = "sc_recent_searches"
const MAX_RECENT = 8

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((entry) => typeof entry === "string")
      : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string) {
  if (typeof window === "undefined") {
    return
  }

  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return
  }

  const next = [trimmed, ...getRecentSearches().filter((entry) => entry !== trimmed)].slice(
    0,
    MAX_RECENT
  )

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function clearRecentSearches() {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

export const OPEN_SEARCH_EVENT = "supercore:open-search"

export function dispatchOpenSearch() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))
}
