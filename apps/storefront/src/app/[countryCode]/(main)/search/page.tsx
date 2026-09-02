import { Metadata } from "next"

import { fetchPopularSearches, searchProducts, type SearchSortOption } from "@lib/data/search"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SearchFilters, {
  SearchSortSelect,
} from "@modules/search/components/search-filters"
import SearchHitCard from "@modules/search/components/search-hit-card"

export const metadata: Metadata = {
  title: "Search",
}

type Params = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    q?: string
    mpn_only?: string
    page?: string
    sort?: string
    category?: string
    certification?: string
    manufacturer?: string
    has_price?: string
    in_stock?: string
  }>
}

function parseList(value?: string) {
  return value?.split(",").map((entry) => entry.trim()).filter(Boolean) ?? []
}

function parseBoolean(value?: string) {
  if (value === "true") return true
  if (value === "false") return false
  return null
}

export default async function SearchPage({ params, searchParams }: Params) {
  const { countryCode } = await params
  const resolvedParams = await searchParams
  const region = await getRegion(countryCode)
  const currencyCode = region?.currency_code ?? "gbp"
  const q = resolvedParams.q ?? ""
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1
  const sort = (resolvedParams.sort as SearchSortOption | undefined) ?? "relevance"

  const [{ hits, found, facet_counts, error, per_page }, popularResponse] =
    await Promise.all([
      searchProducts({
        q,
        mpnOnly: resolvedParams.mpn_only === "true",
        category: parseList(resolvedParams.category),
        certification: parseList(resolvedParams.certification),
        manufacturer: parseList(resolvedParams.manufacturer),
        hasPrice: parseBoolean(resolvedParams.has_price),
        inStock: parseBoolean(resolvedParams.in_stock),
        sort,
        page,
        currencyCode,
      }),
      fetchPopularSearches(),
    ])

  const totalPages = Math.max(1, Math.ceil(found / (per_page || 20)))

  const buildPageHref = (nextPage: number) => {
    const url = new URLSearchParams()

    for (const [key, value] of Object.entries(resolvedParams)) {
      if (value && key !== "page") {
        url.set(key, value)
      }
    }

    if (nextPage > 1) {
      url.set("page", String(nextPage))
    }

    return `/search?${url.toString()}`
  }

  return (
    <div className="content-container py-8 small:py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="sc-section-heading" data-testid="search-page-title">
            {q ? `Search results for "${q}"` : "Search"}
          </h1>
          {!error && q && (
            <p className="mt-2 text-sc-steel">
              {found} result{found === 1 ? "" : "s"}
              {resolvedParams.mpn_only === "true" ? " · MPN only" : ""}
            </p>
          )}
        </div>
        {q && <SearchSortSelect sort={sort} />}
      </div>

      {error && (
        <p className="mb-8 text-sc-steel" data-testid="search-error">
          {error}
        </p>
      )}

      {!q && (
        <div className="rounded-lg border border-sc-line bg-sc-search/40 p-6">
          <p className="text-sc-body">
            Search by part number, MPN, product title, or manufacturer. Use the
            header search bar or press <kbd className="rounded bg-white px-1.5 py-0.5">Ctrl+K</kbd>.
          </p>
          {popularResponse.popular.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-sc-steel">
                Popular searches
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {popularResponse.popular.map((entry) => (
                  <li key={entry.query}>
                    <LocalizedClientLink
                      href={`/search?q=${encodeURIComponent(entry.query)}`}
                      className="rounded-full border border-sc-line bg-white px-3 py-1.5 text-sm hover:border-sc-cta hover:text-sc-cta"
                    >
                      {entry.query}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {q && !error && (
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <SearchFilters facets={facet_counts} />

          <div>
            {hits.length === 0 ? (
              <div className="rounded-lg border border-sc-line bg-white p-6">
                <p className="text-sc-steel">
                  No products matched &quot;{q}&quot;. Try a broader keyword, turn
                  off MPN only, or{" "}
                  <LocalizedClientLink href="/contact-us" className="text-sc-cta">
                    contact sales
                  </LocalizedClientLink>
                  .
                </p>
              </div>
            ) : (
              <ul className="grid gap-4">
                {hits.map((hit) => (
                  <li key={hit.id}>
                    <SearchHitCard hit={hit} currencyCode={currencyCode} />
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between gap-4">
                {page > 1 ? (
                  <LocalizedClientLink
                    href={buildPageHref(page - 1)}
                    className="rounded-md border border-sc-line px-4 py-2 text-sm font-medium hover:border-sc-cta"
                  >
                    Previous
                  </LocalizedClientLink>
                ) : (
                  <span />
                )}
                <p className="text-sm text-sc-steel">
                  Page {page} of {totalPages}
                </p>
                {page < totalPages ? (
                  <LocalizedClientLink
                    href={buildPageHref(page + 1)}
                    className="rounded-md border border-sc-line px-4 py-2 text-sm font-medium hover:border-sc-cta"
                  >
                    Next
                  </LocalizedClientLink>
                ) : (
                  <span />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
