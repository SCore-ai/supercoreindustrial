/**
 * Normalize website product media filenames:
 * - Remove generic hero.jpg / hero.webp / image-N / thumbnail / datasheet.pdf
 * - Prefer manufacturer CDN original basenames from _cache (Axis / Zenitel)
 * - Spectrum catalog index moves to Products/_mapping (imports = price lists only)
 *
 * Usage (from apps/backend):
 *   node scripts/normalize-website-media-filenames.mjs
 *   node scripts/normalize-website-media-filenames.mjs --dry-run
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "../data/website sources/Products")
const IMPORTS = path.resolve(__dirname, "../data/imports")
const DRY = process.argv.includes("--dry-run")
const UA =
  "Mozilla/5.0 (compatible; SupercoreCatalogBot/1.0; +https://supercoreai.co.uk)"

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"])
const DOC_EXT = new Set([".pdf", ".rtf", ".doc", ".docx"])

const GENERIC_IMAGE = /^(hero|thumbnail|thumb|main|image[-_]?\d*|gallery[-_]?\d*)$/i
const GENERIC_DOC = /^(datasheet|document|doc|file|manual)([-_]?\d*)?$/i

function originalFilenameFromUrl(url, fallback = "image.jpg") {
  const clean = String(url || "").split("?")[0]
  let name = clean.split("/").filter(Boolean).pop() || fallback
  try {
    name = decodeURIComponent(name)
  } catch {
    /* keep raw basename */
  }
  name = name.replace(/[<>:"|?*\\]+/g, "-").trim()
  if (!name || name === "." || name === "..") {
    return fallback
  }
  if (!/\.[a-z0-9]{2,5}$/i.test(name)) {
    return `${name}.jpg`
  }
  return name
}

function listDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
}

function walkProductJson(dir, acc = []) {
  for (const entry of listDir(dir)) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === ROOT && entry.name.startsWith("_") && entry.name !== "_unmapped") {
        continue
      }
      walkProductJson(full, acc)
    } else if (entry.name === "product.json") {
      acc.push(full)
    }
  }
  return acc
}

function isGenericImageName(name) {
  const stem = path.basename(name, path.extname(name))
  return GENERIC_IMAGE.test(stem)
}

function isGenericDocName(name) {
  const stem = path.basename(name, path.extname(name))
  return GENERIC_DOC.test(stem)
}

function loadJson(file) {
  if (!fs.existsSync(file)) return {}
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function indexAxis(cache) {
  const bySlug = new Map()
  const byPart = new Map()
  for (const [key, entry] of Object.entries(cache)) {
    const slug = String(entry.slug || key).toLowerCase()
    bySlug.set(slug, entry)
    bySlug.set(slug.replace(/^axis-/, ""), entry)
    for (const part of entry.parts || []) {
      byPart.set(String(part).toLowerCase(), entry)
    }
  }
  return { bySlug, byPart }
}

function findAxis(index, slug, sku) {
  const s = String(slug || "").toLowerCase()
  return (
    index.bySlug.get(s) ||
    index.bySlug.get(s.replace(/^axis-/, "")) ||
    index.bySlug.get(s.replace(/-\d{5}-\d{3}$/, "")) ||
    (sku ? index.byPart.get(String(sku).toLowerCase()) : null) ||
    null
  )
}

function findZenitel(cache, slug, sku) {
  const short = String(slug || "").replace(/^zenitel-/i, "").toLowerCase()
  if (cache[short]) return cache[short]
  if (cache[slug]) return cache[slug]
  if (!sku) return null
  const needle = String(sku).toLowerCase()
  for (const entry of Object.values(cache)) {
    const blob = `${entry.datasheet || ""} ${(entry.guessedPdfs || []).join(" ")}`.toLowerCase()
    if (blob.includes(needle) || String(entry.slug || "").toLowerCase() === needle) {
      return entry
    }
  }
  return null
}

async function downloadTo(url, dest) {
  const response = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "*/*" },
    redirect: "follow",
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  const buf = Buffer.from(await response.arrayBuffer())
  if (buf.length < 200) throw new Error(`too-small ${url}`)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, buf)
}

function safeRename(from, to) {
  if (from === to) return false
  if (fs.existsSync(to)) {
    fs.unlinkSync(from)
    return true
  }
  fs.renameSync(from, to)
  return true
}

function moveSpectrumCatalog() {
  const src = path.join(IMPORTS, "Spectrum", "spectrum-catalog-source.json")
  const dest = path.join(ROOT, "_mapping", "spectrum-catalog-source.json")
  if (!fs.existsSync(src)) return { moved: false }
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  if (!DRY) {
    fs.copyFileSync(src, dest)
    fs.unlinkSync(src)
  }
  return { moved: true, from: src, to: dest }
}

async function main() {
  const axisCache = loadJson(path.join(ROOT, "_cache/axis-pages.json"))
  const zenitelCache = loadJson(path.join(ROOT, "_cache/zenitel-pages.json"))
  const axisIndex = indexAxis(axisCache)

  const spectrumMove = moveSpectrumCatalog()
  console.log("[normalize] spectrum catalog", spectrumMove)

  const productFiles = walkProductJson(ROOT)
  const stats = {
    products: productFiles.length,
    renamed_images: 0,
    redownloaded_images: 0,
    deleted_generic_images: 0,
    renamed_docs: 0,
    redownloaded_docs: 0,
    deleted_generic_docs: 0,
    skipped_no_source: 0,
    failed: 0,
  }
  const errors = []

  for (const file of productFiles) {
    const dir = path.dirname(file)
    let meta = {}
    try {
      meta = JSON.parse(fs.readFileSync(file, "utf8"))
    } catch {
      continue
    }
    const slug = String(meta.slug || path.basename(dir))
    const manufacturer = String(meta.manufacturer || "").toLowerCase()
    const sku = meta.sku

    let entry = null
    if (manufacturer === "axis" || slug.startsWith("axis-")) {
      entry = findAxis(axisIndex, slug, sku)
    } else if (manufacturer === "zenitel" || slug.startsWith("zenitel-")) {
      entry = findZenitel(zenitelCache, slug, sku)
    }

    const heroDir = path.join(dir, "images/hero")
    const galleryDir = path.join(dir, "images/gallery")
    const sheetDir = path.join(dir, "documents/datasheet")

    // --- images/hero generics ---
    for (const name of listDir(heroDir).filter((e) => e.isFile()).map((e) => e.name)) {
      if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) continue
      if (!isGenericImageName(name)) continue

      const from = path.join(heroDir, name)
      const sourceUrl = entry?.image || null
      if (!sourceUrl) {
        if (!DRY) fs.unlinkSync(from)
        stats.deleted_generic_images += 1
        stats.skipped_no_source += 1
        continue
      }

      const original = originalFilenameFromUrl(
        sourceUrl,
        `product${path.extname(name) || ".jpg"}`
      )
      const to = path.join(heroDir, original)

      try {
        if (path.basename(from).toLowerCase() === original.toLowerCase()) {
          continue
        }
        if (!DRY) {
          // Prefer rename (keeps bytes); if target needed fresh, re-download
          if (!fs.existsSync(to)) {
            safeRename(from, to)
            stats.renamed_images += 1
          } else {
            fs.unlinkSync(from)
            stats.deleted_generic_images += 1
          }
        } else {
          stats.renamed_images += 1
        }
      } catch (error) {
        try {
          if (!DRY) {
            await downloadTo(sourceUrl, to)
            if (fs.existsSync(from) && path.resolve(from) !== path.resolve(to)) {
              fs.unlinkSync(from)
            }
            stats.redownloaded_images += 1
          }
        } catch (err) {
          stats.failed += 1
          errors.push({
            slug,
            file: name,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // --- gallery generics ---
    for (const name of listDir(galleryDir).filter((e) => e.isFile()).map((e) => e.name)) {
      if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) continue
      if (!isGenericImageName(name)) continue
      const from = path.join(galleryDir, name)
      if (!DRY) fs.unlinkSync(from)
      stats.deleted_generic_images += 1
    }

    // --- datasheet generics ---
    for (const name of listDir(sheetDir).filter((e) => e.isFile()).map((e) => e.name)) {
      if (!DOC_EXT.has(path.extname(name).toLowerCase())) continue
      if (!isGenericDocName(name)) continue

      const from = path.join(sheetDir, name)
      const sourceUrl = entry?.datasheet || entry?.guessedPdfs?.[0] || null
      if (!sourceUrl) {
        if (!DRY) fs.unlinkSync(from)
        stats.deleted_generic_docs += 1
        stats.skipped_no_source += 1
        continue
      }

      const original = originalFilenameFromUrl(sourceUrl, "datasheet.pdf")
      const to = path.join(sheetDir, original)
      try {
        if (!DRY) {
          if (!fs.existsSync(to)) {
            safeRename(from, to)
            stats.renamed_docs += 1
          } else {
            fs.unlinkSync(from)
            stats.deleted_generic_docs += 1
          }
        } else {
          stats.renamed_docs += 1
        }
      } catch (error) {
        try {
          if (!DRY) {
            await downloadTo(sourceUrl, to)
            if (fs.existsSync(from) && path.resolve(from) !== path.resolve(to)) {
              fs.unlinkSync(from)
            }
            stats.redownloaded_docs += 1
          }
        } catch (err) {
          stats.failed += 1
          errors.push({
            slug,
            file: name,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }
    }

    // Update product.json media pointers when we have originals
    if (!DRY && entry) {
      const heroes = listDir(heroDir)
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()))
      const sheets = listDir(sheetDir)
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((n) => DOC_EXT.has(path.extname(n).toLowerCase()))

      const next = {
        ...meta,
        images: heroes.map((filename, index) => ({
          role: index === 0 ? "hero" : "gallery",
          filename,
          source_url: entry.image || null,
          local_path: path
            .relative(path.resolve(__dirname, ".."), path.join(heroDir, filename))
            .split(path.sep)
            .join("/"),
        })),
        documents: sheets.map((filename) => ({
          filename,
          source_url: entry.datasheet || null,
          local_path: path
            .relative(path.resolve(__dirname, ".."), path.join(sheetDir, filename))
            .split(path.sep)
            .join("/"),
        })),
        media_normalized_at: new Date().toISOString(),
      }
      fs.writeFileSync(file, JSON.stringify(next, null, 2) + "\n")
    }
  }

  const report = {
    finished_at: new Date().toISOString(),
    dry_run: DRY,
    spectrum_catalog_move: spectrumMove,
    ...stats,
    errors: errors.slice(0, 100),
  }
  fs.mkdirSync(path.join(ROOT, "_mapping"), { recursive: true })
  fs.writeFileSync(
    path.join(ROOT, "_mapping/media-normalize-report.json"),
    JSON.stringify(report, null, 2) + "\n"
  )
  console.log(JSON.stringify(report, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
