import { existsSync, readFileSync, writeFileSync } from "fs"
import path from "path"
import { resolveProductHandle } from "../src/lib/catalog/catalog-permalink"

/**
 * Align product.json medusa_handle with the original website slug.
 *
 *   node --import jiti/register ./scripts/write-original-medusa-handles.ts
 */

const ROOT = path.resolve(__dirname, "../data/website sources/Products")
const MANUFACTURERS = new Set(["axis", "spectrum", "tecnovideo", "zenitel"])

type IndexRow = {
  slug: string
  sku?: string | null
  manufacturer?: string | null
  category_path?: string
  title?: string | null
}

const index = JSON.parse(
  readFileSync(path.join(ROOT, "_index.json"), "utf8")
) as { products?: IndexRow[] }

let updated = 0
let skipped = 0

for (const row of index.products || []) {
  const manufacturerId = String(row.manufacturer || "").toLowerCase()
  if (!MANUFACTURERS.has(manufacturerId)) {
    continue
  }
  const jsonPath = path.join(
    ROOT,
    ...String(row.category_path || "").split("/"),
    row.slug,
    "product.json"
  )
  if (!existsSync(jsonPath)) {
    skipped += 1
    continue
  }
  const meta = JSON.parse(readFileSync(jsonPath, "utf8")) as {
    slug?: string
    sku?: string | null
    title?: string | null
    mpn?: string | null
    source_url?: string | null
    permalink?: string | null
    medusa_handle?: string | null
  }
  const nextHandle = resolveProductHandle({
    manufacturerId,
    sku: meta.sku || row.sku,
    sourceUrl: meta.source_url || meta.permalink,
    catalogSlug: meta.slug || row.slug,
    title: meta.title || row.title,
    mpn: meta.mpn,
  })
  if (meta.medusa_handle === nextHandle) {
    skipped += 1
    continue
  }
  meta.medusa_handle = nextHandle
  writeFileSync(jsonPath, `${JSON.stringify(meta, null, 2)}\n`)
  updated += 1
}

console.log(`[medusa-handle-json] updated=${updated} unchanged=${skipped}`)
