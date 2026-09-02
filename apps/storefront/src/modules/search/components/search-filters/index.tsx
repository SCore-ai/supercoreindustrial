"use client"

import type { SearchFacetCount, SearchSortOption } from "@lib/data/search"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type SearchFiltersProps = {
  facets: SearchFacetCount[]
}

function getFacetCounts(facets: SearchFacetCount[], field: string) {
  return facets.find((facet) => facet.field_name === field)?.counts ?? []
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value]
}

const SearchFilters = ({ facets }: SearchFiltersProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pushWith = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(patch)) {
      if (!value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }

    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const selectedCategories = (searchParams.get("category") || "")
    .split(",")
    .filter(Boolean)
  const selectedCertifications = (searchParams.get("certification") || "")
    .split(",")
    .filter(Boolean)
  const selectedManufacturers = (searchParams.get("manufacturer") || "")
    .split(",")
    .filter(Boolean)
  const hasPrice = searchParams.get("has_price")
  const inStock = searchParams.get("in_stock")

  const categoryCounts = getFacetCounts(facets, "category")
  const certificationCounts = getFacetCounts(facets, "certification")
  const manufacturerCounts = getFacetCounts(facets, "manufacturer")
  const hasPriceCounts = getFacetCounts(facets, "has_price")
  const inStockCounts = getFacetCounts(facets, "in_stock")

  const renderCheckboxGroup = (
    title: string,
    field: string,
    selected: string[],
    counts: Array<{ value: string; count: number }>
  ) => {
    if (!counts.length) {
      return null
    }

    return (
      <section className="border-b border-sc-line pb-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sc-steel">
          {title}
        </h2>
        <ul className="space-y-2">
          {counts.map((entry) => (
            <li key={`${field}-${entry.value}`}>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-sc-body">
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(entry.value)}
                    onChange={() =>
                      pushWith({
                        [field]:
                          toggleValue(selected, entry.value).join(",") ||
                          undefined,
                      })
                    }
                    className="h-4 w-4 rounded border-sc-line"
                  />
                  {entry.value}
                </span>
                <span className="text-sc-steel">{entry.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const renderBooleanGroup = (
    title: string,
    field: string,
    selected: string | null,
    counts: Array<{ value: string; count: number }>
  ) => {
    if (!counts.length) {
      return null
    }

    return (
      <section className="border-b border-sc-line pb-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sc-steel">
          {title}
        </h2>
        <ul className="space-y-2">
          {counts.map((entry) => (
            <li key={`${field}-${entry.value}`}>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-sc-body">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={field}
                    checked={selected === entry.value}
                    onChange={() => pushWith({ [field]: entry.value })}
                    onClick={() => {
                      if (selected === entry.value) {
                        pushWith({ [field]: undefined })
                      }
                    }}
                    className="h-4 w-4 border-sc-line"
                  />
                  {entry.value === "true"
                    ? "Yes"
                    : entry.value === "false"
                      ? "No"
                      : entry.value}
                </span>
                <span className="text-sc-steel">{entry.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    const q = searchParams.get("q")
    const mpnOnly = searchParams.get("mpn_only")
    const sort = searchParams.get("sort")

    if (q) params.set("q", q)
    if (mpnOnly) params.set("mpn_only", mpnOnly)
    if (sort) params.set("sort", sort)

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-sc-ink">Filters</h2>
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-sc-steel hover:text-sc-cta"
        >
          Clear all
        </button>
      </div>

      {renderCheckboxGroup(
        "Category",
        "category",
        selectedCategories,
        categoryCounts
      )}
      {renderCheckboxGroup(
        "Certification",
        "certification",
        selectedCertifications,
        certificationCounts
      )}
      {renderCheckboxGroup(
        "Manufacturer",
        "manufacturer",
        selectedManufacturers,
        manufacturerCounts
      )}
      {renderBooleanGroup("Priced", "has_price", hasPrice, hasPriceCounts)}
      {renderBooleanGroup("In stock", "in_stock", inStock, inStockCounts)}
    </aside>
  )
}

type SearchSortProps = {
  sort?: SearchSortOption
}

export function SearchSortSelect({ sort = "relevance" }: SearchSortProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <label className="flex items-center gap-2 text-sm text-sc-steel">
      Sort
      <select
        value={sort}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString())
          const value = event.target.value
          if (value === "relevance") {
            params.delete("sort")
          } else {
            params.set("sort", value)
          }
          params.delete("page")
          router.push(`${pathname}?${params.toString()}`)
        }}
        className="rounded-md border border-sc-line bg-white px-3 py-2 text-sc-body"
      >
        <option value="relevance">Relevance</option>
        <option value="title_asc">Name A-Z</option>
        <option value="title_desc">Name Z-A</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </label>
  )
}

export default SearchFilters
