import {
  existsSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs"
import path from "path"
import {
  isSkuLikeCatalogSlug,
  resolveProductHandle,
} from "../src/lib/catalog/catalog-permalink"

/**
 * Rename manufacturer-SKU accessory folders to title-based slugs.
 *
 *   node --import jiti/register ./scripts/rename-sku-like-product-slugs.ts
 */

const ROOT = path.resolve(__dirname, "../data/website sources/Products")
const MANUFACTURERS = new Set(["axis", "spectrum", "tecnovideo", "zenitel"])
const INDEX_PATH = path.join(ROOT, "_index.json")
const MAPPING_PATH = path.join(ROOT, "_mapping", "category-mapping.csv")

type IndexFile = {
  master?: string
  generated_at?: string
  product_count?: number
  moved?: number
  by_category?: Record<string, number>
  products: IndexRow[]
}

type IndexRow = {
  slug: string
  sku?: string | null
  manufacturer?: string | null
  title?: string | null
  category_handle?: string | null
  category_path?: string | null
  mapping_reason?: string | null
}

type ProductMeta = {
  slug?: string
  sku?: string | null
  title?: string | null
  mpn?: string | null
  source_url?: string | null
  permalink?: string | null
  medusa_handle?: string | null
  legacy_paths?: string[]
  [key: string]: unknown
}

type RenamePlan = {
  row: IndexRow
  manufacturerId: string
  sku: string | null
  fromSlug: string
  toSlug: string
  categoryPath: string
  fromDir: string
  tmpDir: string
  toDir: string
  jsonPath: string
  meta: ProductMeta
}

function uniqueCatalogSlug(base: string, taken: Set<string>): string {
  let candidate = base
  let n = 2
  while (taken.has(candidate)) {
    candidate = `${base}-${n}`
    n += 1
  }
  taken.add(candidate)
  return candidate
}

function rewriteFolderRefs(
  value: unknown,
  fromFolder: string,
  toFolder: string
): unknown {
  if (typeof value === "string") {
    const fromWin = fromFolder.replace(/\//g, "\\")
    const toWin = toFolder.replace(/\//g, "\\")
    return value.split(fromWin).join(toWin).split(fromFolder).join(toFolder)
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteFolderRefs(item, fromFolder, toFolder))
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        rewriteFolderRefs(item, fromFolder, toFolder),
      ])
    )
  }
  return value
}

function loadIndex(): IndexFile {
  return JSON.parse(readFileSync(INDEX_PATH, "utf8")) as IndexFile
}

const index = loadIndex()
const taken = new Set<string>()
const skuLikeRows: IndexRow[] = []

for (const row of index.products || []) {
  const manufacturerId = String(row.manufacturer || "").toLowerCase()
  const slug = String(row.slug || "")
  if (!slug) {
    continue
  }
  if (
    MANUFACTURERS.has(manufacturerId) &&
    isSkuLikeCatalogSlug(manufacturerId, slug, row.sku)
  ) {
    skuLikeRows.push(row)
    continue
  }
  taken.add(slug.toLowerCase())
}

const plans: RenamePlan[] = []
const skipped: Array<{ slug: string; reason: string }> = []
let planIndex = 0

for (const row of skuLikeRows) {
  const manufacturerId = String(row.manufacturer || "").toLowerCase()
  const categoryPath = String(row.category_path || "_unmapped")
  const fromSlug = row.slug
  const fromDir = path.join(ROOT, ...categoryPath.split("/"), fromSlug)
  const jsonPath = path.join(fromDir, "product.json")
  const meta: ProductMeta = existsSync(jsonPath)
    ? (JSON.parse(readFileSync(jsonPath, "utf8")) as ProductMeta)
    : {
        slug: fromSlug,
        sku: row.sku,
        title: row.title,
      }

  const nextHandle = resolveProductHandle({
    manufacturerId,
    sku: meta.sku || row.sku,
    sourceUrl: meta.source_url || meta.permalink,
    catalogSlug: null,
    title: meta.title || row.title,
    mpn: meta.mpn,
  })

  if (
    !nextHandle ||
    isSkuLikeCatalogSlug(manufacturerId, nextHandle, meta.sku || row.sku)
  ) {
    taken.add(fromSlug.toLowerCase())
    skipped.push({ slug: fromSlug, reason: "no-named-title" })
    continue
  }

  if (!existsSync(fromDir)) {
    taken.add(fromSlug.toLowerCase())
    skipped.push({ slug: fromSlug, reason: "missing-folder" })
    continue
  }

  const toSlug = uniqueCatalogSlug(nextHandle, taken)
  const tmpName = `.tmp-rename-${String(planIndex).padStart(4, "0")}`
  planIndex += 1
  plans.push({
    row,
    manufacturerId,
    sku: meta.sku || row.sku || null,
    fromSlug,
    toSlug,
    categoryPath,
    fromDir,
    tmpDir: path.join(ROOT, ...categoryPath.split("/"), tmpName),
    toDir: path.join(ROOT, ...categoryPath.split("/"), toSlug),
    jsonPath,
    meta,
  })
}

const byManufacturer: Record<string, number> = {}
for (const plan of plans) {
  byManufacturer[plan.manufacturerId] =
    (byManufacturer[plan.manufacturerId] || 0) + 1
}

console.log(
  JSON.stringify(
    {
      sku_like: skuLikeRows.length,
      renaming: plans.length,
      skipped: skipped.length,
      by_manufacturer: byManufacturer,
      skip_reasons: skipped.reduce<Record<string, number>>((acc, item) => {
        acc[item.reason] = (acc[item.reason] || 0) + 1
        return acc
      }, {}),
      samples: plans.slice(0, 8).map((plan) => ({
        from: plan.fromSlug,
        to: plan.toSlug,
        title: plan.meta.title || plan.row.title,
      })),
    },
    null,
    2
  )
)

for (const plan of plans) {
  if (existsSync(plan.tmpDir)) {
    throw new Error(`Temp folder already exists: ${plan.tmpDir}`)
  }
  renameSync(plan.fromDir, plan.tmpDir)
}

for (const plan of plans) {
  if (existsSync(plan.toDir)) {
    throw new Error(`Destination folder already exists: ${plan.toDir}`)
  }
  renameSync(plan.tmpDir, plan.toDir)

  const nextJsonPath = path.join(plan.toDir, "product.json")
  const fromFolder = `${plan.categoryPath}/${plan.fromSlug}`
  const toFolder = `${plan.categoryPath}/${plan.toSlug}`
  const rewritten = rewriteFolderRefs(
    plan.meta,
    fromFolder,
    toFolder
  ) as ProductMeta
  const legacy = new Set(
    [...(rewritten.legacy_paths || []), fromFolder].filter(Boolean)
  )
  rewritten.slug = plan.toSlug
  rewritten.medusa_handle = plan.toSlug
  rewritten.legacy_paths = [...legacy]
  writeFileSync(nextJsonPath, `${JSON.stringify(rewritten, null, 2)}\n`)
  plan.row.slug = plan.toSlug
}

index.generated_at = new Date().toISOString()
index.product_count = index.products.length
writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`)

if (existsSync(MAPPING_PATH)) {
  let csv = readFileSync(MAPPING_PATH, "utf8")
  for (const plan of plans) {
    const sku = String(plan.sku || plan.row.sku || "")
    if (sku) {
      csv = csv.split(`,${plan.fromSlug},${sku},`).join(`,${plan.toSlug},${sku},`)
    }
    csv = csv
      .split(`${plan.categoryPath}/${plan.fromSlug}`)
      .join(`${plan.categoryPath}/${plan.toSlug}`)
  }
  writeFileSync(MAPPING_PATH, csv)
}

console.log(
  JSON.stringify(
    {
      written: plans.length,
      index: INDEX_PATH,
      mapping: existsSync(MAPPING_PATH) ? MAPPING_PATH : null,
    },
    null,
    2
  )
)
