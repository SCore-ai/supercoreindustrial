import { listProducts } from "@lib/data/products"
import { getProductPageContent } from "@lib/util/product-page-content"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

type SuccessorProductProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function SuccessorProduct({
  product,
  countryCode,
}: SuccessorProductProps) {
  const content = getProductPageContent(product)

  if (!content.isEol && !content.successorHandle) {
    return null
  }

  const successor = content.successorHandle
    ? await listProducts({
        countryCode,
        queryParams: { handle: content.successorHandle, limit: 1 },
      }).then(({ response }) => response.products[0] ?? null)
    : null

  const successorMeta = successor ? getProductPageContent(successor) : null
  const successorPrice = successor
    ? getProductPrice({ product: successor }).cheapestPrice
    : null
  const thumb =
    successor?.thumbnail ?? successor?.images?.[0]?.url ?? null

  return (
    <div
      id="successor"
      className="scroll-mt-36 mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 small:p-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
        End of life
      </p>
      <h2 className="mt-1 text-base font-bold leading-snug text-sc-ink">
        This product is discontinued
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-sc-steel">
        {content.successorHandle
          ? "The manufacturer has replaced this model. Use the successor below for new projects."
          : "This model has reached end of life. Contact sales if you need a replacement recommendation."}
      </p>

      {successor ? (
        <div className="mt-4 flex gap-3.5 border border-sc-line bg-white p-3">
          <LocalizedClientLink
            href={`/products/${successor.handle}`}
            className="relative h-16 w-16 shrink-0 overflow-hidden border border-sc-line bg-white"
          >
            {thumb ? (
              <Image
                src={thumb}
                alt=""
                fill
                sizes="56px"
                className="object-contain p-1"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-sc-steel">
                No img
              </span>
            )}
          </LocalizedClientLink>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sc-steel">
              Successor
            </p>
            <LocalizedClientLink
              href={`/products/${successor.handle}`}
              className="mt-0.5 block text-sm font-semibold leading-snug text-sc-body hover:text-sc-cta"
            >
              {successor.title}
            </LocalizedClientLink>
            {successorMeta?.manufacturer ? (
              <p className="mt-0.5 text-xs text-sc-steel">
                {successorMeta.manufacturer}
              </p>
            ) : null}
            <p className="mt-1 text-sm font-bold text-sc-ink">
              {successorPrice
                ? convertToLocale({
                    amount: successorPrice.calculated_price_number,
                    currency_code: successorPrice.currency_code,
                  })
                : "Call for price"}
            </p>
            <LocalizedClientLink
              href={`/products/${successor.handle}`}
              className="mt-2 inline-flex text-sm font-bold text-sc-cta underline underline-offset-2"
            >
              View successor
            </LocalizedClientLink>
          </div>
        </div>
      ) : content.successorHandle ? (
        <LocalizedClientLink
          href={`/products/${content.successorHandle}`}
          className="mt-3 inline-flex text-sm font-bold text-sc-cta underline underline-offset-2"
        >
          View successor
        </LocalizedClientLink>
      ) : null}
    </div>
  )
}
