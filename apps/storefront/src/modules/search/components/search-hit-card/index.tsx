"use client"

import type { SearchHit } from "@lib/data/search"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type SearchHitCardProps = {
  hit: SearchHit
  compact?: boolean
  currencyCode?: string
}

function formatPrice(amount: number | null, currencyCode: string) {
  if (!amount || amount <= 0) {
    return null
  }

  return convertToLocale({
    amount,
    currency_code: currencyCode,
    locale: currencyCode === "gbp" ? "en-GB" : undefined,
  })
}

const SearchHitCard = ({
  hit,
  compact = false,
  currencyCode = "gbp",
}: SearchHitCardProps) => {
  const price = formatPrice(hit.price_from, currencyCode)
  const partNumber = hit.mpn[0] || hit.sku[0]

  return (
    <LocalizedClientLink
      href={`/products/${hit.handle}`}
      className={`group flex gap-4 rounded-lg border border-sc-line bg-white transition-shadow hover:shadow-md ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className={compact ? "w-16 shrink-0" : "w-24 shrink-0"}>
        <Thumbnail thumbnail={hit.thumbnail} size={compact ? "small" : "medium"} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="font-medium text-sc-body group-hover:text-sc-cta"
          dangerouslySetInnerHTML={{
            __html: hit.highlight?.title || hit.title,
          }}
        />
        {partNumber && (
          <p className="mt-1 text-sm text-sc-steel">
            Mpn:{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: hit.highlight?.mpn || hit.highlight?.sku || partNumber,
              }}
            />
          </p>
        )}
        {hit.manufacturer && (
          <p className="mt-1 text-sm text-sc-steel">{hit.manufacturer}</p>
        )}
        {!compact && hit.category.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {hit.category.slice(0, 3).map((category) => (
              <span
                key={category}
                className="rounded-full bg-sc-search px-2 py-0.5 text-xs text-sc-steel"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm font-semibold text-sc-body">
          {price ? price : hit.has_price ? "Priced" : "Hide Price"}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

export default SearchHitCard
