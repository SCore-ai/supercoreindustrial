/**
 * Sync Spectrum title/description/handle/media into Medusa via the admin API.
 *
 * Product handles match explosionproofcamera.com permalink slugs.
 * Images use original filenames from website sources, falling back to the
 * Spectrum CDN URL when a local file is missing.
 *
 *   node apps/backend/scripts/sync-spectrum-content-http.mjs
 *   node apps/backend/scripts/sync-spectrum-content-http.mjs --limit=5
 *   node apps/backend/scripts/sync-spectrum-content-http.mjs --force
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PRODUCTS = path.resolve(__dirname, "../data/website sources/Products")
const BASE = process.env.MEDUSA_BACKEND_URL || "http://127.0.0.1:9000"
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || "admin@supercore.local"
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || "SuperCoreAdmin1!"

const args = process.argv.slice(2)
const LIMIT = args.find((a) => a.startsWith("--limit="))
  ? Number(args.find((a) => a.startsWith("--limit=")).slice(8))
  : null
const FORCE = args.includes("--force")

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"])
const GENERIC_IMAGE = /^(hero|gallery-\d+|gallery-img)(\.[a-z0-9]+)?$/i

function mimeType(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  return "application/octet-stream"
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return []
  const files = fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .map((name) => path.join(dir, name))
    .filter((file) => {
      try {
        return fs.statSync(file).isFile() && fs.statSync(file).size > 500
      } catch {
        return false
      }
    })
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)))
  const originals = files.filter((file) => !GENERIC_IMAGE.test(path.basename(file)))
  return originals.length ? originals : files
}

function collectSpectrumFolders(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === PRODUCTS && entry.name.startsWith("_") && entry.name !== "_unmapped") {
        continue
      }
      collectSpectrumFolders(full, acc)
    } else if (entry.name === "product.json") {
      const meta = JSON.parse(fs.readFileSync(full, "utf8"))
      if (String(meta.manufacturer || "").toLowerCase() === "spectrum") {
        acc.push({
          dir: path.dirname(full),
          meta,
          slug: meta.slug,
          sku: meta.sku,
          category_path: meta.category_path,
        })
      }
    }
  }
  return acc
}

function loadSpectrumFolders() {
  return collectSpectrumFolders(PRODUCTS)
}

async function adminLogin() {
  const response = await fetch(`${BASE}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body?.token) {
    throw new Error(
      `admin login failed (${response.status}): ${body?.message || "no token"}`
    )
  }
  return body.token
}

async function adminFetch(pathname, { method = "GET", json, form, token } = {}) {
  const headers = { Authorization: `Bearer ${token}` }
  let body
  if (form) {
    body = form
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(json)
  }
  const response = await fetch(`${BASE}${pathname}`, { method, headers, body })
  const text = await response.text()
  let parsed = null
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = { raw: text }
  }
  if (!response.ok) {
    const message = parsed?.message || parsed?.raw || `HTTP ${response.status}`
    const error = new Error(message)
    error.status = response.status
    throw error
  }
  return parsed
}

async function uploadFile(token, filePath) {
  const filename = path.basename(filePath)
  const buf = fs.readFileSync(filePath)
  const blob = new Blob([buf], { type: mimeType(filePath) })
  const form = new FormData()
  form.append("files", blob, filename)
  const result = await adminFetch("/admin/uploads", { method: "POST", form, token })
  const file = result?.files?.[0] || result?.[0]
  if (!file?.url) {
    throw new Error(`upload missing url for ${filename}`)
  }
  return file.url
}

async function findProduct(token, meta) {
  const handles = [
    meta.medusa_handle,
    meta.slug,
    meta.sku ? `spectrum-${String(meta.sku).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` : null,
  ].filter(Boolean)

  for (const handle of [...new Set(handles)]) {
    const byHandle = await adminFetch(
      `/admin/products?handle=${encodeURIComponent(handle)}&fields=id,handle,title,description,thumbnail,metadata,*images,*variants&limit=1`,
      { token }
    )
    if (byHandle?.products?.[0]) {
      return byHandle.products[0]
    }
  }

  if (!meta.sku) {
    return null
  }
  const bySku = await adminFetch(
    `/admin/products?q=${encodeURIComponent(meta.sku)}&fields=id,handle,title,description,thumbnail,metadata,*images,*variants&limit=10`,
    { token }
  )
  return (
    (bySku?.products || []).find((product) =>
      (product.variants || []).some(
        (variant) =>
          String(variant.sku || "").toLowerCase() === String(meta.sku).toLowerCase() ||
          String(variant.metadata?.parent_sku || "").toLowerCase() ===
            String(meta.sku).toLowerCase() ||
          String(variant.metadata?.manufacturer_sku || "").toLowerCase() ===
            String(meta.sku).toLowerCase()
      )
    ) ||
    (bySku?.products || []).find(
      (product) =>
        String(product.metadata?.mpn || "").toLowerCase() ===
        String(meta.sku).toLowerCase()
    ) ||
    null
  )
}

async function main() {
  const token = await adminLogin()
  const all = loadSpectrumFolders().filter((item) => fs.existsSync(item.dir))
  const slice = LIMIT ? all.slice(0, LIMIT) : all
  console.log(`[spectrum-sync] ${slice.length}/${all.length} force=${FORCE}`)

  const stats = {
    updated: 0,
    images: 0,
    cdn_fallback: 0,
    skipped: 0,
    missing_product: 0,
    errors: 0,
  }
  const missing = []

  for (let i = 0; i < slice.length; i++) {
    const item = slice[i]
    const meta = item.meta || {}
    const handle = meta.medusa_handle || meta.slug
    const permalink = meta.permalink || meta.source_url || null
    const description = String(meta.description || "").trim()
    const title = String(meta.title || "").trim()
    const heroes = listImages(path.join(item.dir, "images", "hero"))
    const gallery = listImages(path.join(item.dir, "images", "gallery"))
    const localFiles = [...heroes, ...gallery]
    const cdnUrls = Array.isArray(meta.images)
      ? meta.images.map((image) => image?.source_url).filter(Boolean)
      : []

    let product
    try {
      product = await findProduct(token, meta)
    } catch (error) {
      stats.errors += 1
      console.warn(`[spectrum-sync] lookup ${meta.sku || handle}: ${error.message}`)
      continue
    }
    if (!product) {
      stats.missing_product += 1
      if (missing.length < 40) missing.push(`${meta.sku || handle}`)
      continue
    }

    const alreadyGood =
      product.handle === handle &&
      (!description || product.description === description) &&
      (product.thumbnail || product.images?.length) &&
      product.metadata?.source_url === permalink &&
      !FORCE
    if (alreadyGood) {
      stats.skipped += 1
      continue
    }

    try {
      const imageUrls = []
      for (const file of localFiles) {
        try {
          imageUrls.push(await uploadFile(token, file))
        } catch (error) {
          console.warn(
            `[spectrum-sync] upload ${path.basename(file)}: ${error.message}`
          )
        }
      }
      if (imageUrls.length) {
        stats.images += 1
      } else if (cdnUrls.length) {
        imageUrls.push(...cdnUrls)
        stats.cdn_fallback += 1
      }

      const metadata = {
        ...(product.metadata || {}),
        manufacturer: "Spectrum",
        manufacturer_id: "spectrum",
        brand: "Spectrum",
        source_url: permalink,
        permalink,
        website_folder: `${meta.category_path || item.category_path}/${handle}`,
        media_source: imageUrls.length
          ? localFiles.length
            ? "website-sources"
            : "spectrum-cdn"
          : product.metadata?.media_source,
      }

      const payload = {
        handle,
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        metadata,
      }
      if (imageUrls.length) {
        payload.thumbnail = imageUrls[0]
        payload.images = imageUrls.map((url) => ({ url }))
      }

      await adminFetch(`/admin/products/${product.id}`, {
        method: "POST",
        json: payload,
        token,
      })
      stats.updated += 1
    } catch (error) {
      stats.errors += 1
      console.warn(`[spectrum-sync] ${meta.sku || handle}: ${error.message}`)
    }

    if ((i + 1) % 10 === 0 || i === slice.length - 1) {
      console.log(
        `[spectrum-sync] ${i + 1}/${slice.length} updated=${stats.updated} images=${stats.images} cdn=${stats.cdn_fallback} missing=${stats.missing_product} errors=${stats.errors}`
      )
    }
  }

  const report = path.join(PRODUCTS, "_mapping", "spectrum-content-sync.json")
  fs.writeFileSync(
    report,
    JSON.stringify(
      { ...stats, missing_sample: missing, finished_at: new Date().toISOString() },
      null,
      2
    ) + "\n"
  )
  console.log(`[spectrum-sync] done report=${report}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
