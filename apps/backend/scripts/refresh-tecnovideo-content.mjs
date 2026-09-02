/**
 * Refresh Tecnovideo content into website product folders (canonical media home).
 *
 * Layout (per product):
 *   data/website sources/Products/{hazardous-area|safe-area}/{category}/{slug}/
 *     product.json
 *     images/hero/{original-cdn-filename}
 *     images/gallery/{original-cdn-filename}   (only if PDP has extra real shots)
 *     documents/datasheet/{original-pdf-filename}
 *
 * Imports stay price-list only:
 *   data/imports/Tecnovideo/tecnovideo-pricelist-eur.csv
 *
 * Catalog index (for rebuild / folder sync):
 *   data/website sources/Products/_mapping/tecnovideo-catalog-source.json
 *
 * Usage (from apps/backend):
 *   node scripts/refresh-tecnovideo-content.mjs
 */

import {
  mkdir,
  writeFile,
  readFile,
  readdir,
  unlink,
  rm,
  access,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseProductPage } from "./tecnovideo-parse.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKEND_ROOT = path.resolve(__dirname, "..")
const IMPORTS_DIR = path.join(BACKEND_ROOT, "data", "imports", "Tecnovideo")
const WEBSITE_ROOT = path.join(
  BACKEND_ROOT,
  "data",
  "website sources",
  "Products"
)
const MAPPING_SOURCE = path.join(
  WEBSITE_ROOT,
  "_mapping",
  "tecnovideo-catalog-source.json"
)
const LEGACY_IMPORT_SOURCE = path.join(
  IMPORTS_DIR,
  "tecnovideo-catalog-source.json"
)
const LEGACY_ASSETS = path.join(IMPORTS_DIR, "assets")

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "SupercoreIndustrialCatalogBot/1.0 (+partner catalog sync)",
      accept: "text/html,application/xhtml+xml",
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

async function downloadForce(url, dest) {
  await mkdir(path.dirname(dest), { recursive: true })
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "SupercoreIndustrialCatalogBot/1.0 (+partner catalog sync)",
    },
  })
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
}

function originalNameFromUrl(url) {
  try {
    return path.basename(new URL(url).pathname) || "file.bin"
  } catch {
    return "file.bin"
  }
}

function productFolder(product) {
  const area =
    product.area === "safe" || product.area === "safe-area"
      ? "safe-area"
      : "hazardous-area"
  return path.join(
    WEBSITE_ROOT,
    area,
    product.category_handle,
    product.slug
  )
}

async function ensureScaffold(folder) {
  for (const rel of ASSET_DIRS) {
    await mkdir(path.join(folder, rel), { recursive: true })
  }
}

async function clearDirFiles(dir) {
  try {
    for (const name of await readdir(dir)) {
      await unlink(path.join(dir, name))
    }
  } catch {
    // missing dir ok
  }
}

async function loadSeedProducts() {
  for (const candidate of [MAPPING_SOURCE, LEGACY_IMPORT_SOURCE]) {
    try {
      await access(candidate)
      const json = JSON.parse(await readFile(candidate, "utf8"))
      if (Array.isArray(json.products) && json.products.length) {
        return json.products
      }
    } catch {
      // try next
    }
  }
  throw new Error(
    "No Tecnovideo catalog seed found (expected _mapping or legacy imports JSON)"
  )
}

async function main() {
  const seed = await loadSeedProducts()
  console.log(`[tecnovideo-refresh] ${seed.length} products → website sources`)

  const products = []
  let ok = 0
  let failed = 0

  for (const existing of seed) {
    try {
      await sleep(200)
      const html = await fetchText(existing.url)
      const parsed = parseProductPage(html, existing.url, {
        area: existing.area,
        category: existing.category,
        handle: existing.category_handle,
      })

      const product = {
        ...existing,
        ...parsed,
        slug: existing.slug || parsed.slug,
        category_handle: existing.category_handle || parsed.category_handle,
        area: existing.area || parsed.area,
        category: existing.category || parsed.category,
      }

      const folder = productFolder(product)
      await ensureScaffold(folder)

      // Replace image/document payloads with manufacturer original filenames
      await clearDirFiles(path.join(folder, "images", "hero"))
      await clearDirFiles(path.join(folder, "images", "gallery"))
      await clearDirFiles(path.join(folder, "documents", "datasheet"))

      const localImages = []
      for (const [index, imageUrl] of (product.images || []).entries()) {
        const filename = originalNameFromUrl(imageUrl)
        const sub = index === 0 ? "images/hero" : "images/gallery"
        const dest = path.join(folder, sub, filename)
        await downloadForce(imageUrl, dest)
        localImages.push({
          role: index === 0 ? "hero" : "gallery",
          source_url: imageUrl,
          filename,
          local_path: path
            .relative(BACKEND_ROOT, dest)
            .replace(/\\/g, "/"),
        })
      }

      const localDocs = []
      for (const sheet of product.datasheets || []) {
        const filename =
          sheet.filename || originalNameFromUrl(sheet.url)
        const dest = path.join(folder, "documents", "datasheet", filename)
        await downloadForce(sheet.url, dest)
        localDocs.push({
          ...sheet,
          filename,
          local_path: path
            .relative(BACKEND_ROOT, dest)
            .replace(/\\/g, "/"),
        })
      }

      const productJson = {
        manufacturer: "Tecnovideo",
        manufacturer_id: "tecnovideo",
        slug: product.slug,
        series: product.series,
        sku: product.series,
        title: product.title,
        subtitle: product.subtitle,
        description: product.description,
        category_handle: product.category_handle,
        category_path: `${
          product.area === "safe" || product.area === "safe-area"
            ? "safe-area"
            : "hazardous-area"
        }/${product.category_handle}`,
        area: product.area,
        source_url: product.url,
        features: product.features,
        certifications: product.certifications,
        models: product.models?.length
          ? product.models
          : [{ sku: product.series, title: product.title }],
        images: localImages,
        documents: localDocs,
        scraped_at: new Date().toISOString(),
      }

      await writeFile(
        path.join(folder, "product.json"),
        JSON.stringify(productJson, null, 2) + "\n",
        "utf8"
      )

      products.push({
        ...product,
        category_path: `${
          product.area === "safe" || product.area === "safe-area"
            ? "safe-area"
            : "hazardous-area"
        }/${product.category_handle}`,
        local_images: localImages,
        local_documents: localDocs,
        folder: path.relative(BACKEND_ROOT, folder).replace(/\\/g, "/"),
      })

      ok += 1
      console.log(
        `  ✓ ${product.series || product.slug}: hero=${localImages[0]?.filename || "-"} docs=${localDocs.length} desc=${(product.description || "").length}c`
      )
    } catch (err) {
      failed += 1
      console.warn(`  ! ${existing.slug}: ${err.message}`)
    }
  }

  await mkdir(path.dirname(MAPPING_SOURCE), { recursive: true })
  const source = {
    source: "https://www.tecnovideocctv.com",
    scraped_at: new Date().toISOString(),
    product_count: products.length,
    products,
  }
  await writeFile(MAPPING_SOURCE, JSON.stringify(source, null, 2), "utf8")

  // Remove legacy import media / catalog blobs (imports = price list only)
  try {
    await rm(LEGACY_ASSETS, { recursive: true, force: true })
    console.log(`[tecnovideo-refresh] removed ${LEGACY_ASSETS}`)
  } catch {
    // ignore
  }
  try {
    await unlink(LEGACY_IMPORT_SOURCE)
    console.log(`[tecnovideo-refresh] removed legacy import catalog JSON`)
  } catch {
    // ignore
  }

  console.log(
    `[tecnovideo-refresh] done ok=${ok} failed=${failed} → ${MAPPING_SOURCE}`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
