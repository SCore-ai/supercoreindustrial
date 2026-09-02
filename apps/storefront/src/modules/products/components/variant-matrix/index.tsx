"use client"

import { addToCart } from "@lib/data/cart"
import { addToQuote } from "@lib/data/quotes"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  shouldShowVariantMatrix,
  variantInStock,
  variantOptionMap,
} from "@lib/util/variant-matrix"
import { HttpTypes } from "@medusajs/types"
import { Button, Table } from "@modules/common/components/ui"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

type VariantMatrixProps = {
  product: HttpTypes.StoreProduct
}

type RowState = Record<string, number>

function hasResolvedPrice(
  product: HttpTypes.StoreProduct,
  variant: HttpTypes.StoreProductVariant
) {
  const { variantPrice } = getProductPrice({
    product,
    variantId: variant.id,
  })
  return !!variantPrice
}

export default function VariantMatrix({ product }: VariantMatrixProps) {
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const [quantities, setQuantities] = useState<RowState>({})
  const [loadingVariantId, setLoadingVariantId] = useState<string | null>(null)

  const options = product.options ?? []
  const variants = product.variants ?? []

  if (!shouldShowVariantMatrix(product) || variants.length === 0) {
    return null
  }

  const getQty = (variantId: string) => quantities[variantId] ?? 1

  const setQty = (variantId: string, qty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [variantId]: Math.max(1, qty),
    }))
  }

  const handleAddToCart = async (variant: HttpTypes.StoreProductVariant) => {
    setLoadingVariantId(variant.id)
    await addToCart({
      variantId: variant.id,
      quantity: getQty(variant.id),
      countryCode,
    })
    setLoadingVariantId(null)
    router.refresh()
  }

  const handleAddToQuote = async (variant: HttpTypes.StoreProductVariant) => {
    setLoadingVariantId(variant.id)
    await addToQuote({
      variantId: variant.id,
      quantity: getQty(variant.id),
      countryCode,
    })
    setLoadingVariantId(null)
    router.push(`/${countryCode}/quote/cart`)
  }

  return (
    <div
      className="content-container scroll-mt-36 border-t border-sc-line bg-sc-paper/40 py-12 small:py-16"
      data-testid="variant-matrix"
      id="models"
    >
      <div className="mb-8">
        <h2 className="border-b border-sc-line pb-3 font-display text-2xl font-bold text-sc-ink">
          Models
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-sc-steel">
          Select your configuration, quantity, and add priced lines to cart or
          add quote-only lines to your quote request.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-sc-line bg-white shadow-sm">
        <Table>
          <Table.Header>
            <Table.Row>
              {options.map((option) => (
                <Table.HeaderCell key={option.id}>
                  {option.title}
                </Table.HeaderCell>
              ))}
              <Table.HeaderCell>Part #</Table.HeaderCell>
              <Table.HeaderCell>Mpn</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Stock</Table.HeaderCell>
              <Table.HeaderCell>Qty</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {variants.map((variant) => {
              const optionValues = variantOptionMap(variant)
              const priced = hasResolvedPrice(product, variant)
              const inStock = variantInStock(variant)
              const price = getProductPrice({
                product,
                variantId: variant.id,
              }).variantPrice
              const mpn = (variant.metadata as Record<string, unknown> | undefined)
                ?.mpn as string | undefined
              const isLoading = loadingVariantId === variant.id

              return (
                <Table.Row key={variant.id} data-testid="variant-matrix-row">
                  {options.map((option) => (
                    <Table.Cell key={option.id}>
                      {optionValues[option.id] ?? "—"}
                    </Table.Cell>
                  ))}
                  <Table.Cell>{variant.sku ?? "—"}</Table.Cell>
                  <Table.Cell>{mpn ?? "—"}</Table.Cell>
                  <Table.Cell>
                    {priced ? price?.calculated_price ?? "—" : "Quote"}
                  </Table.Cell>
                  <Table.Cell>{inStock ? "In stock" : "Out of stock"}</Table.Cell>
                  <Table.Cell>
                    <input
                      type="number"
                      min={1}
                      value={getQty(variant.id)}
                      onChange={(e) =>
                        setQty(variant.id, Number(e.target.value) || 1)
                      }
                      className="w-16 h-8 border border-ui-border-base rounded px-2 text-sm"
                      aria-label={`Quantity for ${variant.sku ?? variant.title}`}
                    />
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {priced ? (
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={!inStock || isLoading}
                        isLoading={isLoading}
                        onClick={() => handleAddToCart(variant)}
                        data-testid="matrix-add-to-cart"
                      >
                        Add to cart
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="small"
                        disabled={isLoading}
                        isLoading={isLoading}
                        onClick={() => handleAddToQuote(variant)}
                        data-testid="matrix-add-to-quote"
                      >
                        Add to quote
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export { shouldShowVariantMatrix }
