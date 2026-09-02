/**
 * Fill missing hero/gallery/datasheet files from manufacturer catalogs:
 * - Axis / Zenitel: _cache page scrape + sibling SKU copy
 * - Spectrum: WooCommerce store images + parent product folders
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
const SPECTRUM_JSON = path.resolve(
  __dirname,
  "../data/website sources/Products/_mapping/spectrum-catalog-source.json"
)
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
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"])
const DOC_EXT = new Set([".pdf", ".rtf", ".doc", ".docx"])
const UA =
  "Mozilla/5.0 (compatible; SupercoreCatalogBot/1.0; +https://supercoreai.co.uk)"

type CacheEntry = {
  page?: string
  slug?: string
  image?: string | null
  datasheet?: string | null
  parts?: string[]
  guessedPdfs?: string[]
}

type ProductMeta = {
  slug: string
  sku?: string | null
  manufacturer?: string | null
  title?: string
  category_handle?: string
  category_path?: string
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
      if (
        dir === ROOT &&
        entry.name.startsWith("_") &&
        entry.name !== "_unmapped"
      ) {
        continue
      }
      collectProductJson(full, acc)
    } else if (entry.name === "product.json") {
      acc.push(full)
    }
  }
  return acc
}

function filesIn(dir: string, exts: Set<string>) {
  return listDir(dir)
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => exts.has(path.extname(name).toLowerCase()))
}

function hasImages(productDir: string) {
  return (
    filesIn(path.join(productDir, "images/hero"), IMAGE_EXT).length > 0 ||
    filesIn(path.join(productDir, "images/gallery"), IMAGE_EXT).length > 0
  )
}

function hasDatasheet(productDir: string) {
  return (
    filesIn(path.join(productDir, "documents/datasheet"), DOC_EXT).length > 0 ||
    filesIn(path.join(productDir, "documents/ae-spec"), DOC_EXT).length > 0
  )
}

function ensureScaffold(productDir: string) {
  for (const rel of ASSET_DIRS) {
    fs.mkdirSync(path.join(productDir, ...rel.split("/")), { recursive: true })
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function extFromUrl(url: string, fallback: string) {
  const clean = url.split("?")[0]
  const ext = path.extname(clean).toLowerCase()
  if (IMAGE_EXT.has(ext) || DOC_EXT.has(ext)) {
    return ext
  }
  return fallback
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

function copyFirstFile(srcDir: string, destDir: string, exts: Set<string>) {
  const names = filesIn(srcDir, exts)
  if (!names.length) {
    return false
  }
  fs.mkdirSync(destDir, { recursive: true })
  const from = path.join(srcDir, names[0])
  const to = path.join(destDir, names[0])
  if (!fs.existsSync(to)) {
    fs.copyFileSync(from, to)
  }
  return true
}

function loadCache(file: string) {
  if (!fs.existsSync(file)) {
    return {} as Record<string, CacheEntry>
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, CacheEntry>
}

function indexAxisCache(cache: Record<string, CacheEntry>) {
  const bySlug = cache
  const byPart = new Map<string, CacheEntry>()
  for (const entry of Object.values(cache)) {
    for (const part of entry.parts ?? []) {
      byPart.set(part.toLowerCase(), entry)
    }
  }
  return { bySlug, byPart }
}

function findAxisCache(
  index: ReturnType<typeof indexAxisCache>,
  slug: string,
  sku?: string | null
) {
  if (index.bySlug[slug]) {
    return index.bySlug[slug]
  }
  const stripped = slug.replace(/-\d{5}-\d{3}$/, "")
  if (stripped !== slug && index.bySlug[stripped]) {
    return index.bySlug[stripped]
  }
  if (sku && index.byPart.get(sku.toLowerCase())) {
    return index.byPart.get(sku.toLowerCase())
  }
  return null
}

function findZenitelCache(
  cache: Record<string, CacheEntry>,
  slug: string,
  sku?: string | null
) {
  const short = slug.replace(/^zenitel-/, "")
  if (cache[short]) {
    return cache[short]
  }
  if (cache[slug]) {
    return cache[slug]
  }
  if (!sku) {
    return null
  }
  const needle = sku.toLowerCase()
  for (const entry of Object.values(cache)) {
    const blob = `${entry.datasheet ?? ""} ${(entry.guessedPdfs ?? []).join(" ")}`.toLowerCase()
    if (blob.includes(needle)) {
      return entry
    }
  }
  return null
}

function siblingParentDir(productDir: string, slug: string) {
  const stripped = slug.replace(/-\d{5}-\d{3}$/, "")
  if (stripped === slug) {
    return null
  }
  const parent = path.join(path.dirname(productDir), stripped)
  return fs.existsSync(path.join(parent, "product.json")) ? parent : null
}

async function pool<T>(items: T[], size: number, worker: (item: T) => Promise<void>) {
  let i = 0
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const item = items[i]
      i += 1
      await worker(item)
    }
  })
  await Promise.all(runners)
}

async function fetchSpectrumImages() {
  const byId = new Map<number, string[]>()
  const bySku = new Map<string, string[]>()
  let page = 1
  let pages = 1
  while (page <= pages && page <= 20) {
    const url = `https://explosionproofcamera.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": UA },
    })
    if (!response.ok) {
      throw new Error(`spectrum store ${response.status}`)
    }
    pages = Number(response.headers.get("X-WP-TotalPages") || page)
    const data = (await response.json()) as Array<{
      id: number
      sku?: string
      images?: Array<{ src?: string }>
    }>
    for (const product of data) {
      const srcs = (product.images ?? [])
        .map((image) => image.src)
        .filter((src): src is string => Boolean(src))
      if (!srcs.length) {
        continue
      }
      byId.set(product.id, srcs)
      if (product.sku) {
        bySku.set(product.sku.toLowerCase(), srcs)
      }
    }
    page += 1
  }
  return { byId, bySku }
}

async function main() {
  const paths = flattenTree(SUPERCORE_CATEGORY_TREE)
  const axisIndex = indexAxisCache(
    loadCache(path.join(ROOT, "_cache/axis-pages.json"))
  )
  const zenitelCache = loadCache(path.join(ROOT, "_cache/zenitel-pages.json"))

  const stats = {
    spectrumCreated: 0,
    copied: 0,
    images: 0,
    datasheets: 0,
    failed: 0,
    skipped: 0,
  }
  const errors: Array<{ slug: string; error: string }> = []

  if (fs.existsSync(SPECTRUM_JSON)) {
    const catalog = JSON.parse(fs.readFileSync(SPECTRUM_JSON, "utf8")) as {
      products: Array<{
        sku: string
        parent_sku?: string
        title: string
        type?: string
        category?: string
        permalink?: string
        wc_id?: number
        description?: string
        description?: string
      }>
    }
    const parents = new Map<string, (typeof catalog.products)[number]>()
    for (const row of catalog.products) {
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
    for (const row of parents.values()) {
      const mapped = mapManufacturerCategory({
        manufacturerId: "spectrum",
        title: row.title,
        sku: row.sku,
        categoryHint: row.category,
      })
      if (mapped.skip || !mapped.handle || !paths.has(mapped.handle)) {
        continue
      }
      const slug = spectrumProductHandle({
        sku: row.sku,
        permalink: row.permalink,
      })
      const dest = path.join(ROOT, ...paths.get(mapped.handle)!.split("/"), slug)
      if (!fs.existsSync(path.join(dest, "product.json"))) {
        ensureScaffold(dest)
        fs.writeFileSync(
          path.join(dest, "product.json"),
          JSON.stringify(
            {
              slug,
              sku: row.sku,
              manufacturer: "spectrum",
              title: row.title,
              category_handle: mapped.handle,
              category_path: paths.get(mapped.handle),
              mapping_reason: mapped.reason,
              permalink: row.permalink ?? null,
              source_url: row.permalink ?? null,
              medusa_handle: slug,
              description: row.description ?? null,
              wc_id: row.wc_id ?? null,
            },
            null,
            2
          ) + "\n"
        )
        stats.spectrumCreated += 1
      } else {
        ensureScaffold(dest)
      }
    }
  }

  let spectrumImages = { byId: new Map<number, string[]>(), bySku: new Map<string, string[]>() }
  try {
    spectrumImages = await fetchSpectrumImages()
  } catch (error) {
    errors.push({
      slug: "spectrum-catalog",
      error: error instanceof Error ? error.message : String(error),
    })
  }

  const jobs: Array<{
    dir: string
    meta: ProductMeta
    imageUrls: string[]
    pdfUrls: string[]
  }> = []

  for (const file of collectProductJson(ROOT)) {
    const dir = path.dirname(file)
    const meta = JSON.parse(fs.readFileSync(file, "utf8")) as ProductMeta
    ensureScaffold(dir)
    const manufacturer = String(meta.manufacturer ?? "").toLowerCase()
    const slug = meta.slug || path.basename(dir)

    const parent = siblingParentDir(dir, slug)
    if (parent) {
      if (!hasImages(dir)) {
        if (
          copyFirstFile(
            path.join(parent, "images/hero"),
            path.join(dir, "images/hero"),
            IMAGE_EXT
          ) ||
          copyFirstFile(
            path.join(parent, "images/gallery"),
            path.join(dir, "images/hero"),
            IMAGE_EXT
          )
        ) {
          stats.copied += 1
        }
      }
      if (!hasDatasheet(dir)) {
        if (
          copyFirstFile(
            path.join(parent, "documents/datasheet"),
            path.join(dir, "documents/datasheet"),
            DOC_EXT
          ) ||
          copyFirstFile(
            path.join(parent, "documents/ae-spec"),
            path.join(dir, "documents/ae-spec"),
            DOC_EXT
          )
        ) {
          stats.copied += 1
        }
      }
    }

    const imageUrls: string[] = []
    const pdfUrls: string[] = []

    if (manufacturer === "axis" || slug.startsWith("axis-")) {
      const entry = findAxisCache(axisIndex, slug, meta.sku)
      if (entry?.image) {
        imageUrls.push(entry.image)
      }
      if (entry?.datasheet) {
        pdfUrls.push(entry.datasheet)
      }
    } else if (manufacturer === "zenitel" || slug.startsWith("zenitel-")) {
      const entry = findZenitelCache(zenitelCache, slug, meta.sku)
      if (entry?.image) {
        imageUrls.push(entry.image)
      }
      if (entry?.datasheet) {
        pdfUrls.push(entry.datasheet)
      }
    } else if (manufacturer === "spectrum" || slug.startsWith("spectrum-")) {
      const wcId = Number(meta.wc_id)
      const srcs =
        (Number.isFinite(wcId) ? spectrumImages.byId.get(wcId) : undefined) ??
        spectrumImages.bySku.get(String(meta.sku ?? "").toLowerCase()) ??
        []
      imageUrls.push(...srcs)
    }

    if (!imageUrls.length && !pdfUrls.length) {
      if (!hasImages(dir) || !hasDatasheet(dir)) {
        stats.skipped += 1
      }
      continue
    }
    jobs.push({ dir, meta, imageUrls, pdfUrls })
  }

  await pool(jobs, 6, async (job) => {
    const slug = job.meta.slug || path.basename(job.dir)
    try {
      if (!hasImages(job.dir) && job.imageUrls[0]) {
        const heroName = originalFilenameFromUrl(
          job.imageUrls[0],
          `product${extFromUrl(job.imageUrls[0], ".jpg")}`
        )
        // Drop any leftover generic hero.* before writing the original name
        const heroDir = path.join(job.dir, "images/hero")
        for (const name of filesIn(heroDir, IMAGE_EXT)) {
          const stem = path.basename(name, path.extname(name))
          if (/^(hero|thumbnail|thumb|main|image[-_]?\d*)$/i.test(stem)) {
            fs.unlinkSync(path.join(heroDir, name))
          }
        }
        await downloadTo(
          job.imageUrls[0],
          path.join(heroDir, heroName)
        )
        stats.images += 1
        for (const extra of job.imageUrls.slice(1, 6)) {
          const name = originalFilenameFromUrl(
            extra,
            `gallery${extFromUrl(extra, ".jpg")}`
          )
          const dest = path.join(job.dir, "images/gallery", name)
          if (!fs.existsSync(dest)) {
            try {
              await downloadTo(extra, dest)
            } catch {
              /* gallery extras are optional */
            }
          }
        }
      }
      if (!hasDatasheet(job.dir) && job.pdfUrls[0]) {
        const sheetName = originalFilenameFromUrl(
          job.pdfUrls[0],
          `datasheet${extFromUrl(job.pdfUrls[0], ".pdf")}`
        )
        const sheetDir = path.join(job.dir, "documents/datasheet")
        for (const name of filesIn(sheetDir, DOC_EXT)) {
          const stem = path.basename(name, path.extname(name))
          if (/^(datasheet|document|doc|file)([-_]?\d*)?$/i.test(stem)) {
            fs.unlinkSync(path.join(sheetDir, name))
          }
        }
        await downloadTo(
          job.pdfUrls[0],
          path.join(sheetDir, sheetName)
        )
        stats.datasheets += 1
      }
    } catch (error) {
      stats.failed += 1
      errors.push({
        slug,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  const report = {
    finished_at: new Date().toISOString(),
    ...stats,
    errors: errors.slice(0, 80),
  }
  fs.writeFileSync(
    path.join(ROOT, "_mapping/asset-refresh-report.json"),
    JSON.stringify(report, null, 2) + "\n"
  )
  console.log(JSON.stringify(stats, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
