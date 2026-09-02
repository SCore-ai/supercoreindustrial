/**
 * Pull Spectrum (explosionproofcamera.com) catalog into a USD pricelist CSV.
 * Includes WooCommerce variations (Connectivity / Router / Region / Antenna).
 * Distributor data-use agreement — source of truth is their public shop.
 */
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const BASE = "https://explosionproofcamera.com"
const IMPORTS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/imports/Spectrum"
)
const MAPPING_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/website sources/Products/_mapping"
)
const OPTION_KEYS = ["Connectivity", "Router", "Region", "Antenna"]

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&#8243;/g, "\"")
    .replace(/&#8220;|&#8221;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function csvEscape(value) {
  const text = String(value ?? "")
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function minorToMajor(amount, minorUnit = 2) {
  const n = Number(amount)
  if (!Number.isFinite(n)) {
    return null
  }
  return n / 10 ** minorUnit
}

function productPrice(product) {
  const prices = product.prices || {}
  const minor = Number(prices.currency_minor_unit ?? 2)
  const rangeMin = prices.price_range?.min_amount
  const rangeMax = prices.price_range?.max_amount
  const min =
    minorToMajor(rangeMin ?? prices.price ?? prices.regular_price, minor) ??
    null
  const max =
    minorToMajor(rangeMax ?? prices.price ?? prices.regular_price, minor) ??
    min
  return { min, max, currency: String(prices.currency_code || "USD").toLowerCase() }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "SupercoreSpectrumCatalog/1.0 (distributor import)",
    },
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`)
  }
  const total = Number(response.headers.get("X-WP-Total") || 0)
  const pages = Number(response.headers.get("X-WP-TotalPages") || 0)
  const data = await response.json()
  return { data, total, pages }
}

async function fetchPaged(pathWithQuery, label) {
  const items = []
  let page = 1
  let pages = 1

  while (page <= pages) {
    const separator = pathWithQuery.includes("?") ? "&" : "?"
    const url = `${BASE}${pathWithQuery}${separator}per_page=100&page=${page}`
    const result = await fetchJson(url)
    const batch = Array.isArray(result.data) ? result.data : []
    items.push(...batch)
    pages = result.pages || (batch.length < 100 ? page : page + 1)
    console.log(`  ${label} page ${page}/${pages || "?"} (+${batch.length})`)
    page += 1
    if (page > 80) {
      break
    }
  }

  return items
}

const CATEGORY_ORDER = [
  "Network Accessories",
  "TEZP & FEZB",
  "Dome Cameras",
  "Fixed Cameras",
  "Junction Boxes",
  "Accessories",
]

function cleanName(value) {
  return stripHtml(String(value || "")).replace(/&amp;/g, "&")
}

function seriesFromCategories(categories) {
  const names = (categories || []).map((c) => cleanName(c.name || c.slug || ""))
  const hay = names.join(" | ").toLowerCase()
  if (hay.includes("tezp") || hay.includes("fezb")) return "TEZP & FEZB"
  if (hay.includes("dome")) return "D-Series"
  if (hay.includes("fixed")) return "F-Series"
  if (hay.includes("junction")) return "Junction Boxes"
  if (hay.includes("network")) return "Network Accessories"
  if (hay.includes("accessor")) return "Accessories"
  return names[0] || "Spectrum"
}

function primaryCategory(categories) {
  const names = (categories || []).map((c) => cleanName(c.name || c.slug || ""))
  for (const preferred of CATEGORY_ORDER) {
    if (names.includes(preferred)) {
      return preferred
    }
  }
  return names[0] || "Spectrum"
}

function parseVariationLabel(label) {
  const text = stripHtml(label || "")
  const options = {}
  for (let i = 0; i < OPTION_KEYS.length; i++) {
    const key = OPTION_KEYS[i]
    const needle = `${key}:`
    const start = text.indexOf(needle)
    if (start < 0) {
      continue
    }
    let end = text.length
    for (let j = i + 1; j < OPTION_KEYS.length; j++) {
      const next = text.indexOf(`, ${OPTION_KEYS[j]}:`, start)
      if (next >= 0 && next < end) {
        end = next
      }
    }
    options[key.toLowerCase()] = text.slice(start + needle.length, end).trim()
  }
  return options
}

function toRow(product, extra = {}) {
  const { min, max, currency } = productPrice(product)
  const categories = (product.categories || [])
    .map((c) => cleanName(c.name))
    .filter(Boolean)
  const sku =
    String(product.sku || extra.sku || "").trim() ||
    String(product.slug || `spectrum-${product.id}`).toUpperCase()

  return {
    sku,
    parent_sku: extra.parent_sku || "",
    title: stripHtml(extra.title || product.name),
    description: stripHtml(
      extra.description || product.short_description || product.description
    ),
    price: extra.price ?? min ?? "",
    usd_price: extra.price ?? min ?? "",
    usd_price_max: extra.usd_price_max ?? max ?? "",
    category: extra.category || primaryCategory(product.categories),
    series: extra.series || seriesFromCategories(product.categories),
    categories: extra.categories || categories.join(" | "),
    mpn: extra.mpn || sku,
    source_currency: currency === "usd" ? "usd" : "usd",
    permalink: extra.permalink || product.permalink || "",
    type: extra.type || product.type || "",
    in_stock: product.is_in_stock ? "yes" : "no",
    wc_id: product.id,
    connectivity: extra.connectivity || "",
    router: extra.router || "",
    region: extra.region || "",
    antenna: extra.antenna || "",
    variant_label: extra.variant_label || "",
  }
}

function toCsv(rows) {
  const headers = [
    "sku",
    "parent_sku",
    "title",
    "description",
    "price",
    "usd_price",
    "usd_price_max",
    "category",
    "series",
    "categories",
    "mpn",
    "source_currency",
    "permalink",
    "type",
    "in_stock",
    "wc_id",
    "connectivity",
    "router",
    "region",
    "antenna",
    "variant_label",
  ]
  const lines = [headers.join(",")]
  for (const row of rows) {
    lines.push(headers.map((key) => csvEscape(row[key])).join(","))
  }
  return lines.join("\n") + "\n"
}

async function main() {
  await mkdir(IMPORTS_DIR, { recursive: true })
  await mkdir(MAPPING_DIR, { recursive: true })
  console.log("Fetching Spectrum WooCommerce catalog…")
  const [products, variations, categories] = await Promise.all([
    fetchPaged("/wp-json/wc/store/v1/products", "products"),
    fetchPaged("/wp-json/wc/store/v1/products?type=variation", "variations"),
    fetchJson(`${BASE}/wp-json/wc/store/v1/products/categories?per_page=100`)
      .then((result) => (Array.isArray(result.data) ? result.data : []))
      .catch((error) => {
        console.warn("categories endpoint failed:", error.message)
        return []
      }),
  ])

  const parentById = new Map(products.map((product) => [product.id, product]))
  const rows = []
  const byCategory = {}
  const variationCounts = {}

  for (const product of products) {
    if (product.type === "variable") {
      continue
    }
    const row = toRow(product)
    if (!row.title) {
      continue
    }
    rows.push(row)
    byCategory[row.category] = (byCategory[row.category] || 0) + 1
  }

  let unmatched = 0
  for (const variation of variations) {
    const parent = parentById.get(variation.parent)
    if (!parent) {
      unmatched += 1
      continue
    }
    const options = parseVariationLabel(variation.variation)
    const { min } = productPrice(variation)
    const parentCats = (parent.categories || [])
      .map((c) => cleanName(c.name))
      .filter(Boolean)
    const sku =
      String(variation.sku || "").trim() ||
      `${parent.sku || parent.slug}-${variation.id}`
    const row = toRow(variation, {
      sku,
      parent_sku: String(parent.sku || "").trim() || String(parent.slug),
      title: stripHtml(parent.name),
      description: stripHtml(parent.short_description || parent.description),
      price: min,
      usd_price_max: min,
      category: primaryCategory(parent.categories),
      series: seriesFromCategories(parent.categories),
      categories: parentCats.join(" | "),
      mpn: sku,
      type: "variation",
      connectivity: options.connectivity || "",
      router: options.router || "",
      region: options.region || "",
      antenna: options.antenna || "",
      variant_label: stripHtml(variation.variation),
      permalink: parent.permalink,
    })
    rows.push(row)
    byCategory[row.category] = (byCategory[row.category] || 0) + 1
    const parentSku = row.parent_sku
    variationCounts[parentSku] = (variationCounts[parentSku] || 0) + 1
  }

  const withPrice = rows.filter((row) => row.price !== "")
  const variableParents = products.filter((p) => p.type === "variable").length
  await mkdir(IMPORTS_DIR, { recursive: true })
  await mkdir(MAPPING_DIR, { recursive: true })
  const csvPath = path.join(IMPORTS_DIR, "spectrum-pricelist-usd.csv")
  const jsonPath = path.join(MAPPING_DIR, "spectrum-catalog-source.json")
  await writeFile(csvPath, toCsv(rows), "utf8")
  await writeFile(
    jsonPath,
    JSON.stringify(
      {
        source: BASE,
        scraped_at: new Date().toISOString(),
        product_count: products.length,
        variable_product_count: variableParents,
        simple_product_count: products.filter((p) => p.type === "simple").length,
        variation_count: variations.length,
        unmatched_variations: unmatched,
        priced_count: withPrice.length,
        row_count: rows.length,
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: c.count,
        })),
        by_category: byCategory,
        variation_counts: variationCounts,
        products: rows,
      },
      null,
      2
    ),
    "utf8"
  )

  console.log(
    `Wrote ${rows.length} rows (${withPrice.length} priced) from ${products.length} products + ${variations.length} variations`
  )
  console.log("Variable parents:", variableParents)
  console.log("Unmatched variations:", unmatched)
  console.log("By category:", byCategory)
  console.log(csvPath)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
