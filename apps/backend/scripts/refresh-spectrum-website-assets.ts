/**
 * Align Spectrum website product folders with explosionproofcamera.com:
 * - folder slug + Medusa handle = public permalink slug
 * - title / description from the USD price list
 * - hero/gallery files keep the manufacturer original filenames
 *
 *   cd apps/backend
 *   node --import jiti/register ./scripts/refresh-spectrum-website-assets.ts
 */
import fs from "fs"
import path from "path"
import {
  SUPERCORE_CATEGORY_TREE,
  type CategorySeed,
} from "../src/lib/seed/supercore-category-tree"
import { mapManufacturerCategory } from "../src/lib/catalog/category-mapping"
import {
  originalFilenameFromUrl,
  spectrumProductHandle,
} from "../src/lib/catalog/spectrum-permalink"

const ROOT = path.resolve(__dirname, "../data/website sources/Products")
const CATALOG = path.resolve(
  __dirname,
  "../data/website sources/Products/_mapping/spectrum-catalog-source.json"
)
const BASE = "https://explosionproofcamera.com"
const UA =
  "Mozilla/5.0 (compatible; SupercoreCatalogBot/1.0; +https://supercoreai.co.uk)"
const ASSET_DIRS = [
  "images/hero",
  "images/gallery",
  "documents/datasheet",
  "documents/manuals",
  "documents/dimensions",
  "documents/certificates",
  "documents/ae-spec",
  "documents/brochures",
]

type CatalogRow = {
  sku: string
  parent_sku?: string
  title: string
  description?: string
  category?: string
  permalink?: string
  wc_id?: number
  type?: string
}

type StoreProduct = {
  id: number
  name?: string
  sku?: string
  slug?: string
  permalink?: string
  short_description?: string
  description?: string
  type?: string
  parent?: number
  categories?: Array<{ name?: string; slug?: string }>
  images?: Array<{ src?: string; name?: string; alt?: string }>
}

type ProductMeta = {
  slug: string
  sku?: string | null
  manufacturer?: string | null
  title?: string
  description?: string | null
  permalink?: string | null
  source_url?: string | null
  medusa_handle?: string | null
  wc_id?: number | null
  category_handle?: string
  category_path?: string
  mapping_reason?: string
  images?: Array<{ role: string; filename: string; source_url: string }>
  [key: string]: unknown
}

function flattenTree(
  tree: CategorySeed[],
  parentPath = "",
  acc: Map<string, string> = new Map()
) {
  for (const node of tree) {
    const folderPath = [parentPath, node.handle].filter(Boolean).join("/")
    acc.set(node.handle, folderPath)
    if (node.children?.length) {
      flattenTree(node.children, folderPath, acc)
    }
  }
  return acc
}

function ensureScaffold(dir: string) {
  for (const rel of ASSET_DIRS) {
    fs.mkdirSync(path.join(dir, ...rel.split("/")), { recursive: true })
  }
}

function listDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs.readdirSync(dir, { withFileTypes: true })
}

function collectProductJson(dir: string, acc: string[] = []) {
  for (const entry of listDir(dir)) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === ROOT && entry.name.startsWith("_") && entry.name !== "_unmapped") {
        continue
      }
      collectProductJson(full, acc)
    } else if (entry.name === "product.json") {
      acc.push(full)
    }
  }
  return acc
}

function stripHtml(value: string) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function slugifySku(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function uniqueName(dir: string, filename: string) {
  const ext = path.extname(filename)
  const stem = path.basename(filename, ext)
  let candidate = filename
  let n = 2
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${n}${ext}`
    n += 1
  }
  return candidate
}

function moveDir(src: string, dest: string) {
  if (src === dest) {
    return
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  if (!fs.existsSync(dest)) {
    try {
      fs.renameSync(src, dest)
      return
    } catch {
      copyMerge(src, dest)
      fs.rmSync(src, { recursive: true, force: true })
      return
    }
  }
  copyMerge(src, dest)
  fs.rmSync(src, { recursive: true, force: true })
}

function copyMerge(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyMerge(from, to)
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to)
    }
  }
}

async function downloadTo(url: string, dest: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    redirect: "follow",
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`)
  }
  const buf = Buffer.from(await response.arrayBuffer())
  if (buf.length < 200) {
    throw new Error(`too-small ${url}`)
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf)
}

async function fetchStoreProducts() {
  const products: StoreProduct[] = []
  let page = 1
  let pages = 1
  while (page <= pages && page <= 20) {
    const url = `${BASE}/wp-json/wc/store/v1/products?per_page=100&page=${page}`
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": UA },
    })
    if (!response.ok) {
      throw new Error(`spectrum store ${response.status}`)
    }
    pages = Number(response.headers.get("X-WP-TotalPages") || page)
    const data = (await response.json()) as StoreProduct[]
    products.push(...data)
    page += 1
  }
  return products.filter((product) => product.type !== "variation")
}

function parentCatalogRows(rows: CatalogRow[]) {
  const parents = new Map<string, CatalogRow>()
  for (const row of rows) {
    if (row.type === "variation" && row.parent_sku) {
      if (!parents.has(row.parent_sku)) {
        parents.set(row.parent_sku, {
          ...row,
          sku: row.parent_sku,
          type: "variable",
        })
      }
      continue
    }
    if (!row.parent_sku) {
      parents.set(row.sku || row.title, row)
    }
  }
  return [...parents.values()]
}

function findExistingDir(
  folders: Array<{ dir: string; meta: ProductMeta }>,
  product: StoreProduct,
  catalog: CatalogRow | undefined
) {
  const sku = String(product.sku || catalog?.sku || "").toLowerCase()
  const wcId = product.id
  const legacy = sku ? `spectrum-${slugifySku(sku)}` : ""
  const slug = spectrumProductHandle({
    sku: product.sku || catalog?.sku,
    permalink: product.permalink || catalog?.permalink,
    slug: product.slug,
  })

  return (
    folders.find((folder) => Number(folder.meta.wc_id) === wcId) ||
    folders.find(
      (folder) => sku && String(folder.meta.sku || "").toLowerCase() === sku
    ) ||
    folders.find((folder) => path.basename(folder.dir).toLowerCase() === slug) ||
    folders.find(
      (folder) => legacy && path.basename(folder.dir).toLowerCase() === legacy
    ) ||
    null
  )
}

async function main() {
  const paths = flattenTree(SUPERCORE_CATEGORY_TREE)
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8")) as {
    products: CatalogRow[]
  }
  const catalogParents = parentCatalogRows(catalog.products)
  const catalogBySku = new Map(
    catalogParents.map((row) => [String(row.sku || "").toLowerCase(), row])
  )
  const catalogById = new Map(
    catalogParents
      .filter((row) => Number.isFinite(Number(row.wc_id)))
      .map((row) => [Number(row.wc_id), row])
  )

  const folders = collectProductJson(ROOT)
    .map((file) => {
      const dir = path.dirname(file)
      const meta = JSON.parse(fs.readFileSync(file, "utf8")) as ProductMeta
      return { dir, meta }
    })
    .filter(
      (folder) => String(folder.meta.manufacturer || "").toLowerCase() === "spectrum"
    )

  const storeProducts = await fetchStoreProducts()
  const stats = {
    store: storeProducts.length,
    renamed: 0,
    created: 0,
    images: 0,
    skipped_images: 0,
    failed_images: 0,
    updated: 0,
  }
  const errors: Array<{ sku: string; error: string }> = []
  const used = new Set<string>()

  for (const product of storeProducts) {
    const catalogRow =
      catalogById.get(product.id) ||
      catalogBySku.get(String(product.sku || "").toLowerCase())
    const sku = String(product.sku || catalogRow?.sku || "").trim()
    const title = stripHtml(product.name || catalogRow?.title || sku)
    const description = stripHtml(
      catalogRow?.description ||
        product.short_description ||
        product.description ||
        ""
    )
    const permalink =
      product.permalink ||
      catalogRow?.permalink ||
      `${BASE}/product/${product.slug || ""}/`
    const slug = spectrumProductHandle({
      sku,
      permalink,
      slug: product.slug,
    })
    const mapped = mapManufacturerCategory({
      manufacturerId: "spectrum",
      title,
      sku,
      categoryHint: catalogRow?.category || product.categories?.[0]?.name,
    })
    if (mapped.skip || !mapped.handle || !paths.has(mapped.handle)) {
      errors.push({ sku: sku || slug, error: `unmapped:${mapped.reason}` })
      continue
    }

    const categoryPath = paths.get(mapped.handle)!
    const dest = path.join(ROOT, ...categoryPath.split("/"), slug)
    const existing = findExistingDir(folders, product, catalogRow)
    if (existing && path.resolve(existing.dir) !== path.resolve(dest)) {
      moveDir(existing.dir, dest)
      stats.renamed += 1
    } else if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true })
      stats.created += 1
    }
    ensureScaffold(dest)
    used.add(path.resolve(dest))

    const imageUrls = [
      ...new Set(
        (product.images || [])
          .map((image) => image.src)
          .filter((src): src is string => Boolean(src))
      ),
    ]

    const localImages: Array<{
      role: string
      filename: string
      source_url: string
    }> = []

    for (const [index, url] of imageUrls.entries()) {
      const role = index === 0 ? "hero" : "gallery"
      const sub = index === 0 ? "images/hero" : "images/gallery"
      const folder = path.join(dest, ...sub.split("/"))
      const original = originalFilenameFromUrl(url, `${slug}.jpg`)
      const existingName = fs.existsSync(path.join(folder, original))
        ? original
        : null
      const filename = existingName || uniqueName(folder, original)
      const destFile = path.join(folder, filename)
      try {
        if (!fs.existsSync(destFile)) {
          await downloadTo(url, destFile)
          stats.images += 1
        } else {
          stats.skipped_images += 1
        }
        localImages.push({ role, filename, source_url: url })
      } catch (error) {
        stats.failed_images += 1
        errors.push({
          sku: sku || slug,
          error: error instanceof Error ? error.message : String(error),
        })
        localImages.push({ role, filename, source_url: url })
      }
    }

    const meta: ProductMeta = {
      ...(existing?.meta || {}),
      slug,
      sku: sku || null,
      manufacturer: "spectrum",
      title,
      description: description || null,
      permalink,
      source_url: permalink,
      medusa_handle: slug,
      wc_id: product.id,
      category_handle: mapped.handle,
      category_path: categoryPath,
      mapping_reason: mapped.reason,
      images: localImages,
    }
    fs.writeFileSync(
      path.join(dest, "product.json"),
      JSON.stringify(meta, null, 2) + "\n"
    )
    stats.updated += 1
  }

  const leftover = folders.filter(
    (folder) => !used.has(path.resolve(folder.dir)) && fs.existsSync(folder.dir)
  )

  const report = {
    finished_at: new Date().toISOString(),
    ...stats,
    leftover: leftover.map((folder) => ({
      dir: path.relative(ROOT, folder.dir).split(path.sep).join("/"),
      sku: folder.meta.sku,
      slug: folder.meta.slug,
    })),
    errors: errors.slice(0, 80),
  }
  fs.writeFileSync(
    path.join(ROOT, "_mapping/spectrum-asset-refresh.json"),
    JSON.stringify(report, null, 2) + "\n"
  )
  console.log(JSON.stringify(report, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
