import { HttpTypes } from "@medusajs/types"

/** Canonical Spectrum / industrial configurator order. Unknown titles follow after. */
export const VARIANT_OPTION_ORDER = [
  "Connectivity",
  "Router",
  "Region",
  "Antenna",
  "Certification",
  "Lens",
  "Housing",
] as const

export function variantOptionsMap(
  variant: HttpTypes.StoreProductVariant
): Record<string, string> {
  return (
    variant.options?.reduce((acc: Record<string, string>, option) => {
      if (option.option_id && option.value) {
        acc[option.option_id] = option.value
      }
      return acc
    }, {}) ?? {}
  )
}

export function sortConfigurableOptions(
  options: HttpTypes.StoreProductOption[]
) {
  return [...options].sort((a, b) => {
    const aTitle = a.title ?? ""
    const bTitle = b.title ?? ""
    const aIndex = VARIANT_OPTION_ORDER.indexOf(
      aTitle as (typeof VARIANT_OPTION_ORDER)[number]
    )
    const bIndex = VARIANT_OPTION_ORDER.indexOf(
      bTitle as (typeof VARIANT_OPTION_ORDER)[number]
    )
    const aRank = aIndex === -1 ? VARIANT_OPTION_ORDER.length : aIndex
    const bRank = bIndex === -1 ? VARIANT_OPTION_ORDER.length : bIndex
    if (aRank !== bRank) {
      return aRank - bRank
    }
    return aTitle.localeCompare(bTitle)
  })
}

export function configurableOptions(product: HttpTypes.StoreProduct) {
  return sortConfigurableOptions(
    (product.options ?? []).filter((option) => option.title !== "Default")
  )
}

export function isConfigurableProduct(product: HttpTypes.StoreProduct) {
  return (
    (product.variants?.length ?? 0) > 1 &&
    configurableOptions(product).length > 0
  )
}

function preferOptionOrder(
  product: HttpTypes.StoreProduct,
  optionId: string,
  values: string[]
) {
  const found = new Set(values)
  const preferred =
    (product.options ?? [])
      .find((option) => option.id === optionId)
      ?.values?.map((value) => value.value)
      .filter((value) => found.has(value)) ?? []
  const extras = values.filter((value) => !preferred.includes(value))
  const ordered = [...preferred, ...extras]
  const real = ordered.filter((value) => value !== "N/A")
  const na = ordered.filter((value) => value === "N/A")
  return [...real, ...na]
}

export function availableOptionValues(
  product: HttpTypes.StoreProduct,
  optionId: string,
  selected: Record<string, string | undefined>
): string[] {
  const optionIds = configurableOptions(product).map((option) => option.id)
  const optionIndex = optionIds.indexOf(optionId)
  const priorIds =
    optionIndex === -1 ? optionIds.filter((id) => id !== optionId) : optionIds.slice(0, optionIndex)
  const found = new Set<string>()

  for (const variant of product.variants ?? []) {
    const map = variantOptionsMap(variant)
    const matches = priorIds.every((id) => {
      const value = selected[id]
      if (!value) {
        return true
      }
      return map[id] === value
    })
    if (matches && map[optionId]) {
      found.add(map[optionId])
    }
  }

  return preferOptionOrder(product, optionId, [...found])
}

export function isOptionUnlocked(
  optionIds: string[],
  optionId: string,
  selected: Record<string, string | undefined>
) {
  const index = optionIds.indexOf(optionId)
  if (index <= 0) {
    return true
  }
  return optionIds.slice(0, index).every((id) => Boolean(selected[id]))
}

export function getOptionSelectState(
  optionIds: string[],
  optionId: string,
  selected: Record<string, string | undefined>,
  available: string[]
) {
  const unlocked = isOptionUnlocked(optionIds, optionId, selected)
  const locked = unlocked && available.length === 1 && Boolean(selected[optionId])
  return {
    unlocked,
    locked,
    pending: !unlocked,
  }
}

export function applyOptionSelection(
  product: HttpTypes.StoreProduct,
  selected: Record<string, string | undefined>,
  optionId: string,
  value: string
): Record<string, string | undefined> {
  const optionIds = configurableOptions(product).map((option) => option.id)
  const next: Record<string, string | undefined> = {
    ...selected,
    [optionId]: value,
  }
  const start = optionIds.indexOf(optionId)

  for (const laterId of optionIds.slice(Math.max(start, 0) + 1)) {
    const available = availableOptionValues(product, laterId, next)
    next[laterId] = available.length === 1 ? available[0] : undefined
  }

  return next
}
