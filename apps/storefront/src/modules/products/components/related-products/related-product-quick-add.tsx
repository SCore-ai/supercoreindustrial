"use client"

import { addToCart } from "@lib/data/cart"
import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"
import { useState } from "react"

type RelatedProductQuickAddProps = {
  handle: string
  variantId?: string
  hasMultipleVariants: boolean
  inStock: boolean
}

export default function RelatedProductQuickAdd({
  handle,
  variantId,
  hasMultipleVariants,
  inStock,
}: RelatedProductQuickAddProps) {
  const countryCode = useParams().countryCode as string
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  if (hasMultipleVariants || !variantId) {
    return (
      <LocalizedClientLink
        href={`/products/${handle}`}
        className="mt-2 inline-flex text-xs font-bold text-sc-body underline-offset-4 hover:text-sc-cta hover:underline"
      >
        See options
      </LocalizedClientLink>
    )
  }

  const handleAdd = async () => {
    setIsAdding(true)
    try {
      await addToCart({ variantId, quantity, countryCode })
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="inline-flex overflow-hidden border border-sc-line bg-white">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || isAdding}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-8 w-8 items-center justify-center text-sm font-medium text-sc-body hover:bg-sc-paper disabled:opacity-40"
        >
          −
        </button>
        <span className="flex h-8 w-8 items-center justify-center border-x border-sc-line text-xs font-semibold text-sc-body">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={isAdding}
          onClick={() => setQuantity((q) => q + 1)}
          className="flex h-8 w-8 items-center justify-center text-sm font-medium text-sc-body hover:bg-sc-paper disabled:opacity-40"
        >
          +
        </button>
      </div>
      <Button
        type="button"
        onClick={handleAdd}
        disabled={!inStock || isAdding}
        variant="primary"
        isLoading={isAdding}
        className="h-8 flex-1 px-2 text-[11px] font-bold uppercase tracking-wide"
      >
        Add to cart
      </Button>
    </div>
  )
}
