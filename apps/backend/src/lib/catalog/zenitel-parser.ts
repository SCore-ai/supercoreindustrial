export type ZenitelRawRow = Record<string, string>

export type ZenitelParsedItem = {
  sku: string
  title: string
  description?: string | null
  source_price: number
  source_currency: string
  /** Optional explicit major-unit prices when the list already includes them. */
  eur_price?: number | null
  gbp_price?: number | null
  usd_price?: number | null
  category?: string | null
  mpn?: string | null
  moq?: number | null
  parent_sku?: string | null
  variant_label?: string | null
  options?: Record<string, string>
  source_url?: string | null
  raw: ZenitelRawRow
}

const SKU_KEYS = [
  "sku",
  "item",
  "item no",
  "item number",
  "item_no",
  "part number",
  "part no",
  "part_no",
  "article",
  "article no",
  "article number",
  "product code",
  "product number",
  "product number eur",
  "product number uk",
  "axis pn uk",
  "axis pn",
  "code",
]

const TITLE_KEYS = [
  "title",
  "name",
  "product name",
  "product",
  "item description",
  "description",
]

const PRICE_KEYS = [
  "price",
  "list price",
  "list_price",
  "msrp",
  "authorized partner price",
  "partner price",
  "eur",
  "euro",
  "unit price",
  "unit_price",
  "net price",
  "rrp",
]

const EUR_PRICE_KEYS = ["eur_price", "price_eur", "price eur", "msrp eur", "eur"]
const GBP_PRICE_KEYS = ["gbp_price", "price_gbp", "price gbp", "gbp"]
const USD_PRICE_KEYS = ["usd_price", "price_usd", "price usd", "usd"]

const CATEGORY_KEYS = ["category", "group", "family", "product group", "status"]
const MPN_KEYS = ["mpn", "manufacturer part", "manufacturer part number"]
const MOQ_KEYS = ["moq", "min qty", "minimum quantity", "min order"]
const PARENT_SKU_KEYS = ["parent_sku", "parent sku"]
const VARIANT_LABEL_KEYS = ["variant_label", "variant label", "variation"]

const OPTION_HEADER_ALIASES: Record<string, string> = {
  connectivity: "Connectivity",
  router: "Router",
  region: "Region",
  antenna: "Antenna",
  option_connectivity: "Connectivity",
  option_router: "Router",
  option_region: "Region",
  option_antenna: "Antenna",
}

function titleCaseOption(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function pickOptions(row: ZenitelRawRow): Record<string, string> {
  const options: Record<string, string> = {}

  for (const [header, rawValue] of Object.entries(row)) {
    const value = rawValue.trim()
    if (!value) {
      continue
    }

    const normalized = normalizeHeader(header).replace(/[_\s]+/g, "_")
    const aliased = OPTION_HEADER_ALIASES[normalized]
    if (aliased) {
      options[aliased] = value
      continue
    }

    const match = normalized.match(/^option[_-](.+)$/)
    if (match?.[1]) {
      options[titleCaseOption(match[1])] = value
    }
  }

  return options
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

function pick(row: ZenitelRawRow, keys: string[]) {
  const entries = Object.entries(row)
  for (const key of keys) {
    const found = entries.find(([header]) => normalizeHeader(header) === key)
    if (found?.[1]?.trim()) {
      return found[1].trim()
    }
  }

  for (const key of keys) {
    const found = entries.find(([header]) =>
      normalizeHeader(header).includes(key)
    )
    if (found?.[1]?.trim()) {
      return found[1].trim()
    }
  }

  return null
}

function parseNumber(value: string | null) {
  if (!value) {
    return null
  }

  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\s/g, "")
    .replace(/,(?=\d{3}\b)/g, "")
    .replace(",", ".")

  const amount = Number(cleaned)
  return Number.isFinite(amount) ? amount : null
}

/** Minimal CSV parser supporting quoted fields and ; or , delimiters. */
export function parseCsv(content: string): ZenitelRawRow[] {
  const text = content.replace(/^\uFEFF/, "").trim()
  if (!text) {
    return []
  }

  const firstLine = text.split(/\r?\n/, 1)[0] ?? ""
  const delimiter =
    (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length
      ? ";"
      : ","

  const rows: string[][] = []
  let current: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      current.push(field)
      field = ""
      continue
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i++
      }
      current.push(field)
      field = ""
      if (current.some((cell) => cell.trim())) {
        rows.push(current)
      }
      current = []
      continue
    }

    field += char
  }

  current.push(field)
  if (current.some((cell) => cell.trim())) {
    rows.push(current)
  }

  if (rows.length < 2) {
    return []
  }

  const headers = rows[0].map((header) => header.trim())
  return rows.slice(1).map((cells) => {
    const row: ZenitelRawRow = {}
    headers.forEach((header, index) => {
      row[header || `col_${index + 1}`] = (cells[index] ?? "").trim()
    })
    return row
  })
}

export function mapZenitelRows(
  rows: ZenitelRawRow[],
  sourceCurrency = "eur",
  options?: { allowMissingPrice?: boolean }
): { items: ZenitelParsedItem[]; skipped: Array<{ reason: string; row: ZenitelRawRow }> } {
  const items: ZenitelParsedItem[] = []
  const skipped: Array<{ reason: string; row: ZenitelRawRow }> = []
  const allowMissingPrice = options?.allowMissingPrice === true

  for (const row of rows) {
    const sku = pick(row, SKU_KEYS)
    const title = pick(row, TITLE_KEYS) ?? sku
    const explicitEur = parseNumber(pick(row, EUR_PRICE_KEYS))
    const explicitGbp = parseNumber(pick(row, GBP_PRICE_KEYS))
    const explicitUsd = parseNumber(pick(row, USD_PRICE_KEYS))
    const price =
      parseNumber(pick(row, PRICE_KEYS)) ??
      explicitGbp ??
      explicitEur ??
      explicitUsd

    if (!sku) {
      skipped.push({ reason: "Missing SKU", row })
      continue
    }

    if ((price == null || price < 0) && !allowMissingPrice) {
      skipped.push({ reason: "Missing/invalid price", row })
      continue
    }

    if (price != null && price < 0) {
      skipped.push({ reason: "Missing/invalid price", row })
      continue
    }

    const rowOptions = pickOptions(row)
    const parentSku = pick(row, PARENT_SKU_KEYS)

    items.push({
      sku,
      title: title || sku,
      description: pick(row, ["description", "long description", "product description"]),
      source_price: price ?? 0,
      source_currency: sourceCurrency,
      eur_price: explicitEur,
      gbp_price: explicitGbp,
      usd_price: explicitUsd,
      category: pick(row, CATEGORY_KEYS),
      mpn: pick(row, MPN_KEYS) ?? sku,
      moq: parseNumber(pick(row, MOQ_KEYS)),
      parent_sku: parentSku && parentSku !== sku ? parentSku : null,
      variant_label: pick(row, VARIANT_LABEL_KEYS),
      options: Object.keys(rowOptions).length ? rowOptions : undefined,
      source_url: pick(row, [
        "permalink",
        "source_url",
        "source url",
        "product url",
      ]),
      raw: row,
    })
  }

  return { items, skipped }
}
