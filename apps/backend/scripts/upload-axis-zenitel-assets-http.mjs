/**
 * Upload local Axis/Zenitel hero images + datasheets to Medusa via the running
 * admin API (avoids `medusa exec` while develop is already bound).
 *
 *   node apps/backend/scripts/upload-axis-zenitel-assets-http.mjs
 *   node apps/backend/scripts/upload-axis-zenitel-assets-http.mjs --limit=20
 *   node apps/backend/scripts/upload-axis-zenitel-assets-http.mjs --force
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
const ONLY = args.find((a) => a.startsWith("--manufacturer="))
  ? args.find((a) => a.startsWith("--manufacturer=")).slice(15).toLowerCase()
  : null

function mimeType(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext === ".png") return "image/png"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  if (ext === ".pdf") return "application/pdf"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  return "application/octet-stream"
}

function listAssets(dir, rel) {
  const folder = path.join(dir, rel)
  if (!fs.existsSync(folder)) return []
  return fs
    .readdirSync(folder)
    .filter((name) => name !== ".gitkeep")
    .map((name) => path.join(folder, name))
    .filter((file) => {
      try {
        const stat = fs.statSync(file)
        return stat.isFile() && stat.size > 500
      } catch {
        return false
      }
    })
}

function parseDocuments(value) {
  if (!value) return []
  if (typeof value === "string") {
    try {
      return parseDocuments(JSON.parse(value))
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value.filter(
    (item) => item && typeof item.name === "string" && typeof item.url === "string"
  )
}

function loadIndex() {
  const index = JSON.parse(
    fs.readFileSync(path.join(PRODUCTS, "_index.json"), "utf8")
  )
  return (index.products || []).filter((row) => {
    const manufacturer = String(row.manufacturer || "").toLowerCase()
    if (manufacturer !== "axis" && manufacturer !== "zenitel") return false
    if (ONLY && manufacturer !== ONLY) return false
    return Boolean(row.sku && row.medusa_handle && row.category_path && row.slug)
  })
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

async function uploadFile(token, filePath, prefix) {
  const filename = `${prefix}-${path.basename(filePath)}`.replace(/\s+/g, "-")
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

async function findProduct(token, handle, sku) {
  const byHandle = await adminFetch(
    `/admin/products?handle=${encodeURIComponent(handle)}&fields=id,handle,thumbnail,metadata,*images,*variants&limit=1`,
    { token }
  )
  const first = byHandle?.products?.[0]
  if (first) return first
  if (!sku) return null
  const bySku = await adminFetch(
    `/admin/products?q=${encodeURIComponent(sku)}&fields=id,handle,thumbnail,metadata,*images,*variants&limit=5`,
    { token }
  )
  return (
    (bySku?.products || []).find((product) =>
      (product.variants || []).some(
        (variant) => String(variant.sku || "").toLowerCase() === sku.toLowerCase()
      )
    ) || null
  )
}

async function main() {
  const token = await adminLogin()
  const all = loadIndex()
  const withAssets = all.filter((item) => {
    const dir = path.join(PRODUCTS, ...item.category_path.split("/"), item.slug)
    return (
      listAssets(dir, "images/hero").length ||
      listAssets(dir, "images/gallery").length ||
      listAssets(dir, "documents/datasheet").length
    )
  })
  const products = LIMIT ? withAssets : all
  const slice = LIMIT ? products.slice(0, LIMIT) : products
  console.log(
    `[http-upload] ${slice.length}/${products.length} force=${FORCE} manufacturer=${ONLY || "all"}`
  )

  const stats = {
    matched: 0,
    uploaded_images: 0,
    uploaded_docs: 0,
    skipped: 0,
    missing_product: 0,
    missing_assets: 0,
    errors: 0,
  }
  const missing = []

  for (let i = 0; i < slice.length; i++) {
    const item = slice[i]
    const dir = path.join(PRODUCTS, ...item.category_path.split("/"), item.slug)
    const heroes = listAssets(dir, "images/hero")
    const gallery = listAssets(dir, "images/gallery")
    const datasheets = listAssets(dir, "documents/datasheet")
    const manuals = listAssets(dir, "documents/manuals")
    if (!heroes.length && !gallery.length && !datasheets.length && !manuals.length) {
      stats.missing_assets += 1
      continue
    }

    let product
    try {
      product = await findProduct(token, item.medusa_handle, item.sku)
    } catch (error) {
      stats.errors += 1
      console.warn(`[http-upload] lookup ${item.sku}: ${error.message}`)
      continue
    }
    if (!product) {
      stats.missing_product += 1
      if (missing.length < 40) missing.push(`${item.manufacturer}:${item.sku}`)
      continue
    }
    stats.matched += 1

    const existingDocs = parseDocuments(product.metadata?.documents)
    const skipImages = Boolean(product.thumbnail || product.images?.length) && !FORCE
    const skipDocs = existingDocs.length > 0 && !FORCE
    if (skipImages && skipDocs) {
      stats.skipped += 1
      continue
    }

    try {
      const imageUrls = []
      if (!skipImages) {
        for (const file of [...heroes, ...gallery]) {
          imageUrls.push(
            await uploadFile(token, file, `${item.manufacturer}-${item.sku}`)
          )
        }
        if (imageUrls.length) stats.uploaded_images += 1
      }

      const nextDocs = skipDocs ? existingDocs : [...existingDocs]
      if (!skipDocs) {
        for (const doc of [
          ...datasheets.map((file) => ({ file, name: "Datasheet", type: "datasheet" })),
          ...manuals.map((file) => ({ file, name: "Manual", type: "manual" })),
        ]) {
          const url = await uploadFile(
            token,
            doc.file,
            `${item.manufacturer}-${item.sku}-${doc.type}`
          )
          if (!nextDocs.some((row) => row.url === url || row.name === doc.name)) {
            nextDocs.push({ name: doc.name, url, type: doc.type })
          }
        }
        if (datasheets.length || manuals.length) stats.uploaded_docs += 1
      }

      const metadata = {
        ...(product.metadata || {}),
        website_folder: `${item.category_path}/${item.slug}`,
        ...(nextDocs.length ? { documents: JSON.stringify(nextDocs) } : {}),
      }
      const payload = { metadata }
      if (imageUrls.length) {
        payload.thumbnail = imageUrls[0]
        payload.images = imageUrls.map((url) => ({ url }))
      }
      await adminFetch(`/admin/products/${product.id}`, {
        method: "POST",
        json: payload,
        token,
      })
    } catch (error) {
      stats.errors += 1
      console.warn(`[http-upload] ${item.sku}: ${error.message}`)
    }

    if ((i + 1) % 25 === 0 || i === slice.length - 1) {
      console.log(
        `[http-upload] ${i + 1}/${slice.length} matched=${stats.matched} images=${stats.uploaded_images} docs=${stats.uploaded_docs} missing=${stats.missing_product} noassets=${stats.missing_assets} errors=${stats.errors}`
      )
    }
  }

  const report = path.join(PRODUCTS, "_mapping", "asset-upload-report.json")
  fs.writeFileSync(
    report,
    JSON.stringify({ ...stats, missing_sample: missing, finished_at: new Date().toISOString() }, null, 2) + "\n"
  )
  console.log(`[http-upload] done report=${report}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
