import type { ProductHighlight } from "@lib/util/product-page-content"

type ProductHighlightsProps = {
  highlights: ProductHighlight[]
  certifications: string[]
}

const ProductHighlights = ({
  highlights,
  certifications,
}: ProductHighlightsProps) => {
  if (!highlights.length && !certifications.length) {
    return null
  }

  return (
    <div className="mt-6 space-y-4">
      {certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert) => (
            <span
              key={cert}
              className="inline-flex items-center rounded-full border border-sc-cta/30 bg-sc-cta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sc-ink"
            >
              {cert}
            </span>
          ))}
        </div>
      )}

      {highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-3 small:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className="rounded-lg border border-sc-line bg-white px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-sc-steel">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-sc-body">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductHighlights
