/**
 * Rebuild Tecnovideo EUR price list from website-sources catalog index.
 * Imports folder stays price-list only.
 *
 * Usage:
 *   node scripts/rebuild-tecnovideo-pricelist.mjs
 */

import { readFile, writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKEND_ROOT = path.resolve(__dirname, "..")
const SOURCE = path.join(
  BACKEND_ROOT,
  "data",
  "website sources",
  "Products",
  "_mapping",
  "tecnovideo-catalog-source.json"
)
const OUT_DIR = path.join(BACKEND_ROOT, "data", "imports", "Tecnovideo")
const CSV = path.join(OUT_DIR, "tecnovideo-pricelist-eur.csv")

function csvEscape(value) {
  const s = String(value ?? "")
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function cleanSku(series, slug) {
  const fromSeries = String(series || "")
    .replace(/[^A-Za-z0-9\-_/]/g, "")
    .replace(/-+$/g, "")
  if (
    fromSeries &&
    fromSeries.length >= 2 &&
    !/DIN-PRO|FontName|FontFile/i.test(fromSeries)
  ) {
    return fromSeries
  }
  return String(slug || "UNKNOWN")
    .toUpperCase()
    .replace(
      /-(PTZ|FIXED|THERMAL|WASHER|JUNCTION|CAMERA|STATION|HOUSING|SYSTEM).*$/i,
      ""
    )
    .replace(/[^A-Z0-9\-]/g, "")
}

const source = JSON.parse(await readFile(SOURCE, "utf8"))
const products = source.products || []

const rows = [
  [
    "sku",
    "title",
    "description",
    "price",
    "eur_price",
    "category",
    "mpn",
    "source_currency",
    "area",
    "series",
    "source_url",
    "datasheet_url",
    "image_url",
    "notes",
  ],
]

const seen = new Set()

for (const product of products) {
  const sku = cleanSku(product.series, product.slug)
  if (seen.has(sku)) continue
  seen.add(sku)

  const hero =
    product.local_images?.find((i) => i.role === "hero")?.source_url ||
    product.images?.[0]?.source_url ||
    (typeof product.images?.[0] === "string" ? product.images[0] : "") ||
    ""

  const datasheet =
    product.local_documents?.[0]?.url ||
    product.datasheets?.[0]?.url ||
    product.documents?.[0]?.url ||
    ""

  rows.push([
    sku,
    product.title,
    product.description || product.subtitle || "",
    "",
    "",
    `${
      product.area === "hazardous" || product.area === "hazardous-area"
        ? "Hazardous Area"
        : "Safe Area"
    } > ${product.category || product.category_handle || ""}`,
    sku,
    "eur",
    product.area,
    product.series,
    product.url || product.source_url || "",
    datasheet,
    hero,
    "PRICE_PENDING - fill partner EUR list price; add extra model SKU rows as needed",
  ])
}

await mkdir(OUT_DIR, { recursive: true })
await writeFile(
  CSV,
  rows.map((r) => r.map(csvEscape).join(",")).join("\n") + "\n",
  "utf8"
)

console.log(`Wrote ${rows.length - 1} EUR price rows → ${CSV}`)
