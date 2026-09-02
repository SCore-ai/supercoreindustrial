import { HttpTypes } from "@medusajs/types"

export type ProductHighlight = {
  label: string
  value: string
}

export type ProductDocument = {
  name: string
  url: string
  type?: string
}

export type ProductSpecGroup = {
  title: string
  rows: Array<{ label: string; value: string }>
}

export type ProductPageContent = {
  manufacturer?: string
  model?: string
  brand?: string
  family?: string
  shortDescription?: string
  courierDelivery?: string
  vatRate: number
  certifications: string[]
  highlights: ProductHighlight[]
  features: string[]
  specGroups: ProductSpecGroup[]
  documents: ProductDocument[]
  shippingNotes?: string
  videoUrl?: string
  categoryLabel?: string
  isEol?: boolean
  successorHandle?: string
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) {
    return fallback
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }

  return value as T
}

function parseStringList(value: unknown): string[] {
  if (value == null) {
    return []
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string")
  }

  if (typeof value === "string") {
    const parsed = parseJson<string[]>(value, [])
    if (parsed.length) {
      return parsed
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function parseHighlights(value: unknown): ProductHighlight[] {
  const parsed = parseJson<ProductHighlight[]>(value, [])
  return parsed.filter(
    (item) =>
      item &&
      typeof item.label === "string" &&
      typeof item.value === "string"
  )
}

function parseDocuments(value: unknown): ProductDocument[] {
  const parsed = parseJson<ProductDocument[]>(value, [])
  return parsed.filter(
    (item) =>
      item && typeof item.name === "string" && typeof item.url === "string"
  )
}

function parseSpecGroups(value: unknown): ProductSpecGroup[] {
  const parsed = parseJson<Record<string, Record<string, string>>>(value, {})

  if (Array.isArray(parsed)) {
    return parsed
      .filter((group) => group?.title && Array.isArray(group.rows))
      .map((group) => ({
        title: group.title as string,
        rows: (group.rows as Array<{ label: string; value: string }>).filter(
          (row) => row?.label && row?.value
        ),
      }))
  }

  return Object.entries(parsed).map(([title, rows]) => ({
    title,
    rows: Object.entries(rows ?? {}).map(([label, specValue]) => ({
      label,
      value: String(specValue),
    })),
  }))
}

function buildCoreSpecGroups(
  product: HttpTypes.StoreProduct
): ProductSpecGroup[] {
  const rows: Array<{ label: string; value: string }> = []

  if (product.material) {
    rows.push({ label: "Material", value: product.material })
  }
  if (product.origin_country) {
    rows.push({ label: "Country of origin", value: product.origin_country })
  }
  if (product.type?.value) {
    rows.push({ label: "Product type", value: product.type.value })
  }
  if (product.weight) {
    rows.push({ label: "Weight", value: `${product.weight} g` })
  }
  if (product.length && product.width && product.height) {
    rows.push({
      label: "Dimensions (L × W × H)",
      value: `${product.length} × ${product.width} × ${product.height} mm`,
    })
  }

  const variantSkus =
    product.variants
      ?.map((variant) => variant.sku)
      .filter(Boolean)
      .slice(0, 5) ?? []

  if (variantSkus.length === 1) {
    rows.unshift({ label: "Part number", value: variantSkus[0] as string })
  } else if (variantSkus.length > 1) {
    rows.push({
      label: "Part numbers",
      value: `${variantSkus.join(", ")}${(product.variants?.length ?? 0) > 5 ? "…" : ""}`,
    })
  }

  if (!rows.length) {
    return []
  }

  return [{ title: "General", rows }]
}

const DEFAULT_SHIPPING =
  "Handling time: ships on the next business day after order confirmation. UK & EU express delivery typically 2–3 business days. International lead times vary by destination and customs processing."

const DEFAULT_COURIER =
  "Courier delivery: UK & EU express 2–3 business days. International 2–10 business days. Tracking provided on dispatch."

export function getProductPageContent(
  product: HttpTypes.StoreProduct
): ProductPageContent {
  const metadata = (product.metadata ?? {}) as Record<string, unknown>

  const specGroups = parseSpecGroups(metadata.specifications)
  const coreSpecs = buildCoreSpecGroups(product)

  const mergedSpecGroups = [...specGroups]
  if (coreSpecs.length && !specGroups.some((group) => group.title === "General")) {
    mergedSpecGroups.push(...coreSpecs)
  } else if (!specGroups.length) {
    mergedSpecGroups.push(...coreSpecs)
  }

  const brand = typeof metadata.brand === "string" ? metadata.brand : undefined
  const family = typeof metadata.family === "string" ? metadata.family : undefined
  const manufacturer =
    typeof metadata.manufacturer === "string"
      ? metadata.manufacturer
      : brand
  const model =
    typeof metadata.model === "string" ? metadata.model : family

  const vatRate =
    typeof metadata.vat_rate === "number"
      ? metadata.vat_rate
      : typeof metadata.vat_rate === "string"
        ? Number(metadata.vat_rate) || 20
        : 20

  const shortDescription =
    typeof metadata.short_description === "string"
      ? metadata.short_description
      : product.description
        ? product.description.slice(0, 280) +
          (product.description.length > 280 ? "…" : "")
        : undefined

  const successorHandle =
    typeof metadata.successor_handle === "string" &&
    metadata.successor_handle.trim()
      ? metadata.successor_handle.trim()
      : typeof metadata.successor_slug === "string" &&
          metadata.successor_slug.trim()
        ? metadata.successor_slug.trim()
        : undefined

  const isEol =
    String(metadata.lifecycle ?? "").toLowerCase() === "eol" ||
    metadata.category_handle === "legacy-devices"

  return {
    manufacturer,
    model,
    brand,
    family,
    shortDescription,
    courierDelivery:
      typeof metadata.courier_delivery === "string"
        ? metadata.courier_delivery
        : DEFAULT_COURIER,
    vatRate,
    categoryLabel:
      typeof metadata.category_label === "string"
        ? metadata.category_label
        : product.collection?.title,
    certifications: parseStringList(metadata.certifications),
    highlights: parseHighlights(metadata.highlights),
    features: parseStringList(metadata.features),
    specGroups: mergedSpecGroups,
    documents: parseDocuments(metadata.documents),
    shippingNotes:
      typeof metadata.shipping_notes === "string"
        ? metadata.shipping_notes
        : DEFAULT_SHIPPING,
    videoUrl:
      typeof metadata.video_url === "string" ? metadata.video_url : undefined,
    isEol,
    successorHandle,
  }
}

export function getProductSections(
  content: ProductPageContent,
  options?: { matrixMode?: boolean }
) {
  const sections: Array<{ id: string; label: string; visible: boolean }> = [
    ...(options?.matrixMode
      ? [{ id: "models", label: "Models", visible: true }]
      : []),
    { id: "description", label: "Details", visible: true },
    {
      id: "features",
      label: "Features",
      visible: content.features.length > 0,
    },
    {
      id: "specifications",
      label: "Specifications",
      visible: content.specGroups.length > 0,
    },
    {
      id: "documents",
      label: "Documentation",
      visible: content.documents.length > 0,
    },
    { id: "shipping", label: "Support", visible: true },
  ]

  return sections.filter((section) => section.visible)
}

export function getProductJumpSections(
  content: ProductPageContent,
  options?: {
    matrixMode?: boolean
    hasRelated?: boolean
  }
) {
  const sections: Array<{ id: string; label: string }> = []

  if (options?.matrixMode) {
    sections.push({ id: "models", label: "Models" })
  }

  sections.push({ id: "description", label: "Details" })

  if (content.documents.length > 0) {
    sections.push({ id: "documents", label: "Documentation" })
  }

  if (content.isEol || content.successorHandle) {
    sections.push({ id: "successor", label: "Successor" })
  }

  if (options?.hasRelated) {
    sections.push({ id: "related", label: "Related Items" })
  }

  sections.push({ id: "request-quote", label: "Request Quote" })

  return sections
}
