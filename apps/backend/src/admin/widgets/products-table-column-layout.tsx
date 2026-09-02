import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import "../styles/products-table.css"

/**
 * Widths keyed by exact header label text (case-insensitive).
 * Applied by matching <th> text so column order changes cannot mis-target.
 */
const COLUMN_WIDTHS: Record<string, { width: string; minWidth: string }> = {
  product: { width: "28%", minWidth: "260px" },
  status: { width: "8%", minWidth: "88px" },
  inventory: { width: "7%", minWidth: "80px" },
  variants: { width: "7%", minWidth: "80px" },
  category: { width: "23%", minWidth: "160px" },
  categories: { width: "23%", minWidth: "160px" },
  channels: { width: "8%", minWidth: "88px" },
  "sales channels": { width: "8%", minWidth: "88px" },
  catalogs: { width: "8%", minWidth: "88px" },
  collection: { width: "8%", minWidth: "88px" },
  "product type": { width: "10%", minWidth: "110px" },
  type: { width: "10%", minWidth: "110px" },
  vendor: { width: "10%", minWidth: "96px" },
}

function normalizeHeader(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase()
}

function applyColumnWidths(root: ParentNode = document) {
  const tables = root.querySelectorAll<HTMLTableElement>(
    "body.sci-products-list table"
  )

  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th"))
    if (!headers.length) {
      return
    }

    headers.forEach((th, index) => {
      const label = normalizeHeader(th.textContent || "")
      const config = COLUMN_WIDTHS[label]
      if (!config) {
        return
      }

      th.style.setProperty("width", config.width, "important")
      th.style.setProperty("min-width", config.minWidth, "important")
      th.style.setProperty("max-width", "none", "important")

      table.querySelectorAll(`tbody tr`).forEach((row) => {
        const cell = row.children.item(index) as HTMLElement | null
        if (!cell) {
          return
        }
        cell.style.setProperty("width", config.width, "important")
        cell.style.setProperty("min-width", config.minWidth, "important")
        cell.style.setProperty("max-width", "none", "important")
      })
    })
  })
}

/**
 * Marks Products list and sizes columns by header label (not nth-child).
 */
const ProductsTableColumnLayoutWidget = () => {
  useEffect(() => {
    document.body.classList.add("sci-products-list")

    let frame = 0
    const scheduleApply = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => applyColumnWidths())
    }

    scheduleApply()

    const observer = new MutationObserver(scheduleApply)

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.body.classList.remove("sci-products-list")
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default ProductsTableColumnLayoutWidget
