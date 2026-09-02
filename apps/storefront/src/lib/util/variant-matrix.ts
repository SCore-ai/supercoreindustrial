import { HttpTypes } from "@medusajs/types"

export function shouldShowVariantMatrix(
  _product: HttpTypes.StoreProduct
): boolean {
  return false
}

export function variantOptionMap(
  variant: HttpTypes.StoreProductVariant
): Record<string, string> {
  return (
    variant.options?.reduce((acc: Record<string, string>, opt) => {
      if (opt.option_id && opt.value) {
        acc[opt.option_id] = opt.value
      }
      return acc
    }, {}) ?? {}
  )
}

export function variantInStock(
  variant: HttpTypes.StoreProductVariant
): boolean {
  if (!variant.manage_inventory) {
    return true
  }

  if (variant.allow_backorder) {
    return true
  }

  return (variant.inventory_quantity ?? 0) > 0
}
