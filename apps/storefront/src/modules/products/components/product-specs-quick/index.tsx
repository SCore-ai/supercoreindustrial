import type { ProductPageContent } from "@lib/util/product-page-content"
import { clx } from "@modules/common/components/ui"

type ProductSpecsQuickProps = {
  content: ProductPageContent
  partNumber?: string | null
  productId?: string | null
  weight?: number | null
  variant?: "button" | "panel"
}

const ProductSpecsQuick = ({
  content,
  partNumber,
  productId,
  weight,
  variant = "button",
}: ProductSpecsQuickProps) => {
  const hasDocs = content.documents.length > 0
  const hasSpecs = content.specGroups.length > 0
  const primaryDoc = content.documents[0]
  const specsAnchor = hasSpecs ? "#specifications" : "#details"
  const docsAnchor = hasDocs ? "#documents" : specsAnchor

  if (!partNumber && !productId && !weight && !hasDocs && !hasSpecs) {
    return null
  }

  if (variant === "button") {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={docsAnchor}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-sc-line bg-white px-4 text-sm font-semibold text-sc-body transition-colors hover:border-sc-steel hover:bg-sc-paper"
        >
          Specs &amp; Docs
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </a>
        {primaryDoc && (
          <a
            href={primaryDoc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
          >
            {primaryDoc.name}
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-lg border border-sc-line bg-sc-paper/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sc-steel">
        Specs &amp; docs
      </p>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {partNumber && (
          <div>
            <dt className="font-semibold text-sc-steel">Part #</dt>
            <dd className="font-mono text-sc-body">{partNumber}</dd>
          </div>
        )}
        {productId && (
          <div>
            <dt className="font-semibold text-sc-steel">Product ID</dt>
            <dd className="font-mono text-sc-body">{productId}</dd>
          </div>
        )}
        {weight != null && (
          <div>
            <dt className="font-semibold text-sc-steel">Weight</dt>
            <dd className="text-sc-body">{(weight / 453.592).toFixed(2)} LBS</dd>
          </div>
        )}
      </dl>
      {(hasDocs || hasSpecs) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {hasSpecs && (
            <a
              href="#specifications"
              className={clx(
                "text-sm font-semibold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
              )}
            >
              View specifications
            </a>
          )}
          {hasDocs &&
            content.documents.slice(0, 2).map((doc) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
              >
                {doc.name}
              </a>
            ))}
        </div>
      )}
    </div>
  )
}

export default ProductSpecsQuick
