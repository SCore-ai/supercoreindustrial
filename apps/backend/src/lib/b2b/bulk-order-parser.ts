export type BulkOrderRow = {
  sku: string
  quantity: number
  line: number
}

export type BulkOrderParseFailure = {
  line: number
  reason: string
  raw?: string
}

export type BulkOrderParseResult = {
  rows: BulkOrderRow[]
  failures: BulkOrderParseFailure[]
}

const SKU_KEYS = [
  "sku",
  "part number",
  "part no",
  "part_no",
  "item",
  "item no",
  "item number",
  "item_no",
  "article",
  "article no",
  "product code",
  "code",
  "mpn",
]

const QTY_KEYS = ["qty", "quantity", "q", "amount", "count", "units"]

const MAX_ROWS = 500

export function normalizeBulkOrderSku(value: string) {
  return value.trim()
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ")
}

function pickColumn(row: Record<string, string>, keys: string[]) {
  for (const [header, value] of Object.entries(row)) {
    const normalized = normalizeHeader(header)
    if (keys.includes(normalized)) {
      return value
    }
  }

  return null
}

function parseQuantity(raw: string) {
  const cleaned = raw.replace(/[^\d.,-]/g, "").replace(",", ".")
  const quantity = Number(cleaned)

  if (!Number.isFinite(quantity) || quantity < 1) {
    return null
  }

  return Math.floor(quantity)
}

function parseCsvMatrix(content: string) {
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

  return rows
}

function rowsFromCsv(content: string): BulkOrderParseResult {
  const matrix = parseCsvMatrix(content)
  const failures: BulkOrderParseFailure[] = []

  if (!matrix.length) {
    return { rows: [], failures }
  }

  const headers = matrix[0].map((header) => normalizeHeader(header))
  const hasSkuHeader = headers.some((header) => SKU_KEYS.includes(header))
  const hasQtyHeader = headers.some((header) => QTY_KEYS.includes(header))
  const useHeaderless = !hasSkuHeader && matrix[0].length >= 2

  const parsedRows: BulkOrderRow[] = []

  const dataRows = useHeaderless ? matrix : matrix.slice(1)

  for (let index = 0; index < dataRows.length; index++) {
    const line = useHeaderless ? index + 1 : index + 2
    const cells = dataRows[index]

    if (!cells.some((cell) => cell.trim())) {
      continue
    }

    let sku = ""
    let quantityRaw = ""

    if (useHeaderless) {
      sku = cells[0] ?? ""
      quantityRaw = cells[1] ?? "1"
    } else {
      const row: Record<string, string> = {}
      matrix[0].forEach((header, headerIndex) => {
        row[header || `col_${headerIndex + 1}`] = (cells[headerIndex] ?? "").trim()
      })

      sku = pickColumn(row, SKU_KEYS) ?? ""
      quantityRaw = pickColumn(row, QTY_KEYS) ?? "1"
    }

    const normalizedSku = normalizeBulkOrderSku(sku)

    if (!normalizedSku) {
      failures.push({
        line,
        reason: "Missing SKU",
        raw: cells.join(","),
      })
      continue
    }

    const quantity = parseQuantity(quantityRaw || "1")

    if (!quantity) {
      failures.push({
        line,
        reason: "Invalid quantity",
        raw: cells.join(","),
      })
      continue
    }

    parsedRows.push({
      sku: normalizedSku,
      quantity,
      line,
    })
  }

  return mergeDuplicateRows(parsedRows, failures)
}

function mergeDuplicateRows(rows: BulkOrderRow[], failures: BulkOrderParseFailure[]) {
  const merged = new Map<string, BulkOrderRow>()

  for (const row of rows) {
    const key = row.sku.toLowerCase()
    const existing = merged.get(key)

    if (existing) {
      existing.quantity += row.quantity
      continue
    }

    merged.set(key, { ...row })
  }

  const combined = Array.from(merged.values())

  if (combined.length > MAX_ROWS) {
    return {
      rows: combined.slice(0, MAX_ROWS),
      failures: [
        ...failures,
        {
          line: 0,
          reason: `Too many rows (${combined.length}). Limit is ${MAX_ROWS}.`,
        },
      ],
    }
  }

  return { rows: combined, failures }
}

export function parseBulkOrderRows(
  input: Array<{ sku?: string | null; quantity?: number | null }>
): BulkOrderParseResult {
  const failures: BulkOrderParseFailure[] = []
  const parsedRows: BulkOrderRow[] = []

  input.forEach((entry, index) => {
    const sku = normalizeBulkOrderSku(String(entry.sku ?? ""))
    const quantity = Number(entry.quantity ?? 1)

    if (!sku) {
      failures.push({ line: index + 1, reason: "Missing SKU" })
      return
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      failures.push({ line: index + 1, reason: "Invalid quantity", raw: sku })
      return
    }

    parsedRows.push({
      sku,
      quantity: Math.floor(quantity),
      line: index + 1,
    })
  })

  return mergeDuplicateRows(parsedRows, failures)
}

export function parseBulkOrderInput(input: {
  rows?: Array<{ sku?: string | null; quantity?: number | null }>
  csv?: string | null
}): BulkOrderParseResult {
  if (input.csv?.trim()) {
    return rowsFromCsv(input.csv)
  }

  if (input.rows?.length) {
    return parseBulkOrderRows(input.rows)
  }

  return {
    rows: [],
    failures: [{ line: 0, reason: "Provide rows or csv content" }],
  }
}
