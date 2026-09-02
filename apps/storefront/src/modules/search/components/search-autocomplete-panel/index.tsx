"use client"

import type { AutocompleteResponse } from "@lib/data/search"
import { autocompleteSearch } from "@lib/data/search"
import { currencyCodeForCountry } from "@lib/regions/currency-for-country"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import SearchHitCard from "../search-hit-card"

type SearchAutocompletePanelProps = {
  query: string
  mpnOnly: boolean
  open: boolean
  recentSearches: string[]
  popularSearches: string[]
  onSelectQuery: (query: string) => void
  onViewAll: () => void
}

const SearchAutocompletePanel = ({
  query,
  mpnOnly,
  open,
  recentSearches,
  popularSearches,
  onSelectQuery,
  onViewAll,
}: SearchAutocompletePanelProps) => {
  const { countryCode } = useParams()
  const currencyCode = currencyCodeForCountry(countryCode)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AutocompleteResponse | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResult(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = window.setTimeout(async () => {
      const response = await autocompleteSearch({
        q: trimmed,
        mpnOnly,
        limit: 6,
        currencyCode,
      })
      setResult(response)
      setLoading(false)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query, mpnOnly, open, currencyCode])

  if (!open) {
    return null
  }

  const trimmed = query.trim()
  const showSuggestions = trimmed.length < 2

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-lg border border-sc-line bg-white shadow-xl">
      {showSuggestions ? (
        <div className="p-4">
          {recentSearches.length > 0 && (
            <section className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sc-steel">
                Recent searches
              </h3>
              <ul className="space-y-1">
                {recentSearches.map((entry) => (
                  <li key={entry}>
                    <button
                      type="button"
                      onClick={() => onSelectQuery(entry)}
                      className="w-full rounded-md px-2 py-2 text-left text-sm text-sc-body hover:bg-sc-search"
                    >
                      {entry}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {popularSearches.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-sc-steel">
                Popular searches
              </h3>
              <ul className="space-y-1">
                {popularSearches.map((entry) => (
                  <li key={entry}>
                    <button
                      type="button"
                      onClick={() => onSelectQuery(entry)}
                      className="w-full rounded-md px-2 py-2 text-left text-sm text-sc-body hover:bg-sc-search"
                    >
                      {entry}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!recentSearches.length && !popularSearches.length && (
            <p className="text-sm text-sc-steel">
              Search by part number, MPN, product name, or manufacturer.
            </p>
          )}
          <p className="mt-4 text-xs text-sc-steel">
            Tip: press <kbd className="rounded bg-sc-search px-1.5 py-0.5">Ctrl+K</kbd> anywhere to
            open search.
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {loading && <p className="text-sm text-sc-steel">Searching…</p>}
          {!loading && result?.products?.length === 0 && (
            <p className="text-sm text-sc-steel">No products matched &quot;{trimmed}&quot;.</p>
          )}
          {!loading && !!result?.products?.length && (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-sc-steel">
                Products
              </h3>
              <ul className="space-y-2">
                {result.products.map((hit) => (
                  <li key={hit.id}>
                    <SearchHitCard hit={hit} compact currencyCode={currencyCode} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!loading && !!result?.categories?.length && (
            <section className="mt-4 border-t border-sc-line pt-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-sc-steel">
                Categories
              </h3>
              <ul className="space-y-1">
                {result.categories.map((category) => (
                  <li key={category.name}>
                    <LocalizedClientLink
                      href={`/search?q=${encodeURIComponent(trimmed)}&category=${encodeURIComponent(category.name)}`}
                      className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-sc-search"
                    >
                      <span>{category.name}</span>
                      <span className="text-sc-steel">{category.count}</span>
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!loading && (result?.found ?? 0) > 0 && (
            <button
              type="button"
              onClick={onViewAll}
              className="mt-4 w-full rounded-md bg-sc-search px-4 py-3 text-left text-sm font-semibold text-sc-body hover:bg-sc-paper"
            >
              View all {result?.found} results for &quot;{trimmed}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchAutocompletePanel
