"use client"

import { addToCart } from "@lib/data/cart"
import { addToQuote } from "@lib/data/quotes"
import { useIntersection } from "@lib/hooks/use-in-view"
import type { ProductPageContent } from "@lib/util/product-page-content"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  applyOptionSelection,
  availableOptionValues,
  configurableOptions,
  getOptionSelectState,
  isConfigurableProduct,
  variantOptionsMap,
} from "@lib/util/option-availability"
import { HttpTypes } from "@medusajs/types"
import { Button, clx } from "@modules/common/components/ui"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import ProductQuantityStepper from "@modules/products/components/product-quantity-stepper"
import ProductSpecsQuick from "@modules/products/components/product-specs-quick"
import ProductVatPrice from "@modules/products/components/product-vat-price"
import { isEqual } from "lodash"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  purchaseInfo: ProductPageContent
  disabled?: boolean
  hidePricesForGuests?: boolean
  quotesEnabled?: boolean
  tieredPricingEnabled?: boolean
  isLoggedIn?: boolean
  matrixMode?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => variantOptionsMap({ options: variantOptions } as HttpTypes.StoreProductVariant)

export default function ProductActions({
  product,
  disabled,
  hidePricesForGuests = false,
  quotesEnabled = true,
  tieredPricingEnabled = false,
  isLoggedIn = false,
  region,
  purchaseInfo,
  matrixMode = false,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const countryCode = useParams().countryCode as string

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants?.length) return

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => applyOptionSelection(product, prev, optionId, value))
  }

  const resetOptions = () => {
    setOptions({})
    setQuantity(1)
  }

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) return

    if (value) params.set("v_id", value)
    else params.delete("v_id")

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant, pathname, router, searchParams])

  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) return true
    if (selectedVariant?.allow_backorder) return true
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant.inventory_quantity || 0) > 0
    ) {
      return true
    }
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const addItem = async () => {
    if (!selectedVariant?.id) return false
    await addToCart({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
    return true
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    await addItem()
    setIsAdding(false)
  }

  const handleBuyNow = async () => {
    setIsBuying(true)
    const added = await addItem()
    setIsBuying(false)
    if (added) router.push(`/${countryCode}/checkout`)
  }

  const handleAddToQuote = async () => {
    if (!selectedVariant?.id) return
    setIsAdding(true)
    await addToQuote({
      variantId: selectedVariant.id,
      quantity,
      countryCode,
    })
    setIsAdding(false)
    router.push(`/${countryCode}/quote/cart`)
  }

  const hasResolvedPrice = useMemo(() => {
    if (!selectedVariant) return true
    const { variantPrice } = getProductPrice({
      product,
      variantId: selectedVariant.id,
    })
    return !!variantPrice
  }, [product, selectedVariant])

  const sku = selectedVariant?.sku
  const mpn = (selectedVariant?.metadata as Record<string, unknown> | undefined)
    ?.mpn as string | undefined

  const partNumber =
    sku ??
    (matrixMode
      ? ((product.metadata as Record<string, unknown> | undefined)?.parent_sku as
          | string
          | undefined)
      : purchaseInfo.model)

  const isBusy = isAdding || isBuying
  const optionList = useMemo(
    () => configurableOptions(product),
    [product]
  )
  const optionIds = useMemo(
    () => optionList.map((option) => option.id),
    [optionList]
  )
  const showOptionDropdowns = !matrixMode && isConfigurableProduct(product)

  const availableByOptionId = useMemo(() => {
    const map: Record<string, string[]> = {}
    for (const option of optionList) {
      map[option.id] = availableOptionValues(product, option.id, options)
    }
    return map
  }, [optionList, product, options])

  const stockLabel = !selectedVariant
    ? matrixMode
      ? "Select options in matrix below"
      : "Select options for details"
    : !isValidVariant
      ? "Configuration unavailable"
      : inStock
        ? selectedVariant.manage_inventory &&
            (selectedVariant.inventory_quantity ?? 0) > 0 &&
            (selectedVariant.inventory_quantity ?? 0) <= 5
          ? `Low stock (${selectedVariant.inventory_quantity} left)`
          : "Ready to ship"
        : selectedVariant.allow_backorder
          ? "Available on backorder"
          : "Contact for availability"

  const stockReady = inStock && isValidVariant && !!selectedVariant

  return (
    <>
      <div ref={actionsRef} className="sc-product-buy-box">
        {purchaseInfo.manufacturer && (
          <p className="sc-product-manufacturer">
            {purchaseInfo.manufacturer}
          </p>
        )}

        <h1 className="sc-product-title mt-1" data-testid="product-title">
          {product.title}
        </h1>

        {purchaseInfo.isEol ? (
          <p className="mt-2 inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
            End of life
          </p>
        ) : null}

        {purchaseInfo.model && purchaseInfo.model !== partNumber && (
          <p className="mt-1 text-[15px] font-medium text-sc-steel">
            Model:{" "}
            <span className="font-mono text-sc-body">{purchaseInfo.model}</span>
          </p>
        )}

        <div className="sc-product-meta mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          {partNumber && (
            <p>
              <span className="font-semibold text-sc-steel">Part #:</span>{" "}
              <span className="font-mono font-medium text-sc-body">{partNumber}</span>
            </p>
          )}
          <p
            className={clx(
              "font-semibold",
              stockReady
                ? "text-emerald-700"
                : selectedVariant?.allow_backorder
                  ? "text-amber-700"
                  : "text-sc-steel"
            )}
            data-testid="stock-status"
          >
            <span className="font-semibold text-sc-steel">In Stock:</span>{" "}
            {stockLabel}
          </p>
        </div>

        {mpn && (
          <p className="mt-1.5 text-[15px] text-sc-steel">
            <span className="font-semibold">Mpn:</span>{" "}
            <span className="font-mono text-sc-body">{mpn}</span>
          </p>
        )}

        {purchaseInfo.shortDescription && (
          <p className="mt-4 text-[15px] leading-relaxed text-sc-steel">
            {purchaseInfo.shortDescription}
          </p>
        )}

        {showOptionDropdowns && (
          <div className="sc-product-configure">
            <div>
              <p className="sc-product-configure-title">Configure</p>
              <p className="sc-product-configure-copy">
                Choose options to match an exact part number and price.
              </p>
            </div>
            {optionList.map((option, index) => {
              const available = availableByOptionId[option.id] ?? []
              const { locked, pending } = getOptionSelectState(
                optionIds,
                option.id,
                options,
                available
              )
              const previousTitle = optionList[index - 1]?.title
              const hint = locked
                ? options[option.id] === "N/A"
                  ? "Not applicable for this configuration"
                  : "Only one choice is available"
                : pending
                  ? `Select ${previousTitle} first`
                  : undefined
              return (
                <OptionSelect
                  key={option.id}
                  option={option}
                  current={options[option.id]}
                  updateOption={setOptionValue}
                  title={option.title ?? ""}
                  values={pending ? [] : available}
                  locked={locked}
                  pending={pending}
                  previousTitle={previousTitle}
                  hint={hint}
                  data-testid="product-options"
                  disabled={!!disabled || isBusy}
                />
              )
            })}
          </div>
        )}

        {!matrixMode && (
          <>
            <div className="mt-5">
              <ProductQuantityStepper
                value={quantity}
                onChange={setQuantity}
                disabled={!!disabled || isBusy}
              />
            </div>

            {/* INS: price + primary CTA on one row */}
            <div className="mt-5 flex flex-col gap-4 border-t border-sc-line pt-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                <ProductVatPrice
                  product={product}
                  variant={selectedVariant}
                  quantity={quantity}
                  vatRate={purchaseInfo.vatRate}
                  hidePriceForGuest={hidePricesForGuests}
                  tieredPricingEnabled={tieredPricingEnabled}
                  isLoggedIn={isLoggedIn}
                  currencyCode={region.currency_code}
                  inline
                />
              </div>

              {selectedVariant && !hasResolvedPrice && quotesEnabled ? (
                <Button
                  onClick={handleAddToQuote}
                  disabled={!!disabled || isBusy || !isValidVariant}
                  variant="primary"
                  className="h-12 shrink-0 px-8 text-sm font-bold uppercase tracking-wide sm:min-w-[11rem]"
                  isLoading={isAdding}
                  data-testid="request-quote-button"
                >
                  Add to quote
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={
                    !inStock ||
                    !selectedVariant ||
                    !!disabled ||
                    isBusy ||
                    !isValidVariant
                  }
                  variant="primary"
                  className="h-12 shrink-0 bg-sc-cta px-8 text-sm font-bold uppercase tracking-wide text-sc-ink hover:bg-sc-cta-hover sm:min-w-[11rem]"
                  isLoading={isAdding}
                  data-testid="add-product-button"
                >
                  {!selectedVariant
                    ? "Select options"
                    : !inStock || !isValidVariant
                      ? "Out of stock"
                      : "Add to cart"}
                </Button>
              )}
            </div>

            <ProductSpecsQuick
              content={purchaseInfo}
              partNumber={partNumber}
              productId={selectedVariant?.id?.slice(-12) ?? product.id.slice(-12)}
              weight={product.weight ?? undefined}
              variant="button"
            />

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {hasResolvedPrice && quotesEnabled && (
                <Button
                  onClick={handleAddToQuote}
                  disabled={!!disabled || isBusy || !isValidVariant}
                  variant="secondary"
                  className="h-11 border-2 border-sc-ink px-6 text-sm font-bold uppercase tracking-wide text-sc-ink hover:bg-sc-paper"
                  isLoading={isAdding}
                  data-testid="secondary-quote-button"
                >
                  Add to quote
                </Button>
              )}
              {showOptionDropdowns && (
                <button
                  type="button"
                  onClick={resetOptions}
                  className="text-sm font-semibold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
                >
                  Reset selection
                </button>
              )}
            </div>

            {hasResolvedPrice && selectedVariant && inStock && (
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!!disabled || isBusy || !isValidVariant}
                className="mt-3 text-sm font-semibold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline disabled:opacity-50"
                data-testid="buy-now-button"
              >
                {isBuying ? "Processing…" : "Buy now — go to checkout"}
              </button>
            )}

            {purchaseInfo.courierDelivery && (
              <p className="mt-5 border-t border-sc-line pt-4 text-xs leading-relaxed text-sc-steel">
                {purchaseInfo.courierDelivery}
              </p>
            )}
          </>
        )}

        {matrixMode && (
          <div className="mt-6 space-y-4 border-t border-sc-line pt-6">
            <p className="text-sm leading-relaxed text-sc-steel">
              This product has multiple configurations. Select your model and
              license in the <strong className="text-sc-body">Models</strong> table
              below, then add to cart or quote.
            </p>
            <ProductSpecsQuick
              content={purchaseInfo}
              partNumber={partNumber}
              productId={product.id.slice(-12)}
              weight={product.weight ?? undefined}
            />
          </div>
        )}
      </div>

      {!matrixMode && (
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          availableByOptionId={availableByOptionId}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          handleAddToQuote={handleAddToQuote}
          isAdding={isBusy}
          show={!inView}
          optionsDisabled={!!disabled || isBusy}
          hasResolvedPrice={hasResolvedPrice}
        />
      )}
    </>
  )
}
