import { defineCellRenderer } from "@medusajs/dashboard/lib"

type InventoryLevel = {
  stocked_quantity?: number | null
  reserved_quantity?: number | null
}

type InventoryItem = {
  location_levels?: InventoryLevel[] | null
}

type ProductVariant = {
  manage_inventory?: boolean | null
  inventory_items?: InventoryItem[] | null
}

type ProductRow = {
  title?: string | null
  handle?: string | null
  thumbnail?: string | null
  variants?: ProductVariant[] | null
  type?: { value?: string | null } | null
  metadata?: Record<string, unknown> | null
}

/**
 * Must live at src/admin/cell-renderers.tsx (admin-vite-plugin loads that path only).
 * Product title fills the fluid Product column — no fixed max-width cap.
 */
defineCellRenderer("product_info", {
  truncateTooltip: false,
  render: (_value, row: ProductRow) => {
    const title = row.title?.trim() || "-"
    const thumbnail = row.thumbnail
    const handle = row.handle?.trim()
    const publicPath = handle ? `/gb/products/${handle}` : ""

    return (
      <div className="flex h-full w-full min-w-0 items-center gap-x-3 overflow-hidden">
        <div className="bg-ui-bg-component h-8 w-8 flex-shrink-0 overflow-hidden rounded-md">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <span
            className="txt-compact-small text-ui-fg-base min-w-0 truncate"
            title={title}
          >
            {title}
          </span>
          {publicPath ? (
            <span
              className="txt-compact-xsmall text-ui-fg-muted min-w-0 truncate"
              title={publicPath}
            >
              {publicPath}
            </span>
          ) : null}
        </div>
      </div>
    )
  },
})

function availableQuantity(variant: ProductVariant) {
  let total = 0
  let hasLevels = false

  for (const item of variant.inventory_items ?? []) {
    for (const level of item.location_levels ?? []) {
      hasLevels = true
      total +=
        (Number(level.stocked_quantity) || 0) -
        (Number(level.reserved_quantity) || 0)
    }
  }

  return { total, hasLevels }
}

defineCellRenderer("product_inventory", {
  render: (_value, row: ProductRow) => {
    const variants = row.variants ?? []

    if (!variants.length) {
      return "-"
    }

    const tracked = variants.filter((variant) => variant.manage_inventory)

    if (!tracked.length) {
      return "Not tracked"
    }

    let available = 0
    let anyLevels = false

    for (const variant of tracked) {
      const result = availableQuantity(variant)
      available += result.total
      anyLevels = anyLevels || result.hasLevels
    }

    if (!anyLevels) {
      return "0 in stock"
    }

    return `${available} in stock`
  },
})

defineCellRenderer("product_type_label", {
  render: (_value, row: ProductRow) => {
    return row.type?.value?.trim() || "-"
  },
})

defineCellRenderer("product_vendor", {
  render: (_value, row: ProductRow) => {
    const metadata = row.metadata ?? {}
    const vendor =
      metadata.vendor ??
      metadata.brand ??
      metadata.manufacturer ??
      metadata.manufacturer_id

    if (vendor === null || vendor === undefined || vendor === "") {
      return "-"
    }

    return String(vendor)
  },
})
