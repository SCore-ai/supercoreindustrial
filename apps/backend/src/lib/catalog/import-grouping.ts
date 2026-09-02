import type { ZenitelParsedItem } from "./zenitel-parser"

export const VARIANT_OPTION_TITLES = [
  "Connectivity",
  "Router",
  "Region",
  "Antenna",
] as const

export type ManufacturerProductGroup = {
  parentSku: string
  title: string
  description?: string | null
  category?: string | null
  source_url?: string | null
  items: ZenitelParsedItem[]
}

function firstNonEmpty(
  items: ZenitelParsedItem[],
  key: "description" | "source_url" | "title"
) {
  for (const item of items) {
    const value = item[key]
    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }
  return items[0]?.[key] ?? null
}

export type ProductOptionSpec = {
  title: string
  values: string[]
}

export function groupItemsByParent(
  items: ZenitelParsedItem[]
): ManufacturerProductGroup[] {
  const map = new Map<string, ZenitelParsedItem[]>()

  for (const item of items) {
    const key = (item.parent_sku || item.sku).trim()
    const existing = map.get(key)
    if (existing) {
      existing.push(item)
    } else {
      map.set(key, [item])
    }
  }

  return [...map.entries()].map(([parentSku, groupItems]) => ({
    parentSku,
    title: firstNonEmpty(groupItems, "title") || groupItems[0].title,
    description: firstNonEmpty(groupItems, "description"),
    category: groupItems[0].category,
    source_url: firstNonEmpty(groupItems, "source_url"),
    items: groupItems,
  }))
}

export function buildProductOptions(items: ZenitelParsedItem[]): {
  options: ProductOptionSpec[]
  isDefault: boolean
} {
  const titles = new Set<string>()
  for (const item of items) {
    for (const key of Object.keys(item.options || {})) {
      if (key.trim()) {
        titles.add(key)
      }
    }
  }

  const ordered = VARIANT_OPTION_TITLES.filter((title) => titles.has(title))
  const extra = [...titles].filter(
    (title) =>
      !VARIANT_OPTION_TITLES.includes(title as (typeof VARIANT_OPTION_TITLES)[number])
  )
  const allTitles = [...ordered, ...extra]

  if (!allTitles.length) {
    return {
      options: [{ title: "Default", values: ["Default"] }],
      isDefault: true,
    }
  }

  return {
    isDefault: false,
    options: allTitles.map((title) => {
      const values = [
        ...new Set(
          items.map((item) => (item.options?.[title] || "N/A").trim() || "N/A")
        ),
      ]
      return { title, values }
    }),
  }
}

export function variantOptionMap(
  item: ZenitelParsedItem,
  optionTitles: string[],
  isDefault: boolean
): Record<string, string> {
  if (isDefault) {
    return { Default: "Default" }
  }

  const mapped: Record<string, string> = {}
  for (const title of optionTitles) {
    mapped[title] = (item.options?.[title] || "N/A").trim() || "N/A"
  }
  return mapped
}

export function variantTitle(
  item: ZenitelParsedItem,
  optionTitles: string[],
  isDefault: boolean
) {
  if (isDefault) {
    return "Default"
  }

  const label = item.variant_label?.trim()
  if (label) {
    return label
  }

  return optionTitles
    .map((title) => item.options?.[title] || "N/A")
    .join(" · ")
}
