/**
 * Scrape Tecnovideo Hazardous Area + Safe Area catalog from tecnovideocctv.com.
 *
 * Outputs:
 *   data/imports/Tecnovideo/tecnovideo-pricelist-eur.csv          (price list only)
 *   data/website sources/Products/_mapping/tecnovideo-catalog-source.json
 *   data/website sources/Products/<area>/<category-handle>/<slug>/
 *     product.json + images/hero|gallery + documents/datasheet
 *     (manufacturer original filenames)
 *
 * Usage (from apps/backend):
 *   node scripts/scrape-tecnovideo.mjs
 */

import { mkdir, writeFile, readFile, access, readdir, unlink } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BACKEND_ROOT = path.resolve(__dirname, "..")
const BASE = "https://www.tecnovideocctv.com"
const OUT_DIR = path.join(BACKEND_ROOT, "data", "imports", "Tecnovideo")
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

const CATEGORY_PAGES = [
  {
    area: "hazardous",
    category: "PTZ camera stations",
    handle: "haz-ptz-stations",
    url: `${BASE}/products/atex-hazardous-area/PTZ-camera-stations`,
  },
  {
    area: "hazardous",
    category: "Fixed camera stations",
    handle: "haz-fixed-stations",
    url: `${BASE}/products/atex-hazardous-area/fixed-camera-stations`,
  },
  {
    area: "hazardous",
    category: "PTZ camera housing",
    handle: "haz-ptz-housing",
    url: `${BASE}/products/atex-hazardous-area/PTZ-camera-housing`,
  },
  {
    area: "hazardous",
    category: "Fixed camera housing",
    handle: "haz-fixed-housing",
    url: `${BASE}/products/atex-hazardous-area/fixed-camera-housing`,
  },
  {
    area: "hazardous",
    category: "Pan & Tilt",
    handle: "haz-pan-tilt",
    url: `${BASE}/products/atex-hazardous-area/pan-and-tilt`,
  },
  {
    area: "hazardous",
    category: "Illuminators",
    handle: "haz-illuminators",
    url: `${BASE}/products/atex-hazardous-area/illuminators`,
  },
  {
    area: "hazardous",
    category: "Washer systems and accessories",
    handle: "haz-washer-systems",
    url: `${BASE}/products/atex-hazardous-area/washer-systems-and-accessories`,
  },
  {
    area: "safe",
    category: "PTZ camera stations",
    handle: "safe-ptz-stations",
    url: `${BASE}/products/safe-area/PTZ-camera-stations`,
  },
  {
    area: "safe",
    category: "Fixed camera stations",
    handle: "safe-fixed-stations",
    url: `${BASE}/products/safe-area/fixed-camera-stations`,
  },
  {
    area: "safe",
    category: "PTZ camera housing",
    handle: "safe-ptz-housing",
    url: `${BASE}/products/safe-area/PTZ-camera-housing`,
  },
  {
    area: "safe",
    category: "Fixed camera housing",
    handle: "safe-fixed-housing",
    url: `${BASE}/products/safe-area/fixed-camera-housing`,
  },
  {
    area: "safe",
    category: "Pan & Tilt",
    handle: "safe-pan-tilt",
    url: `${BASE}/products/safe-area/pan-and-tilt`,
  },
  {
    area: "safe",
    category: "Illuminators",
    handle: "safe-illuminators",
    url: `${BASE}/products/safe-area/illuminators`,
  },
  {
    area: "safe",
    category: "Washer systems and accessories",
    handle: "safe-washer-systems",
    url: `${BASE}/products/safe-area/washer-systems-and-accessories`,
  },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "SupercoreIndustrialCatalogBot/1.0 (+partner catalog sync; contact ops@supercore)",
      accept: "text/html,application/xhtml+xml",
    },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`)
  }
  return res.text()
}

async function downloadFile(url, dest, { force = false } = {}) {
  await mkdir(path.dirname(dest), { recursive: true })
  if (!force) {
    try {
      await access(dest)
      return dest
    } catch {
      // continue
    }
  }

  const res = await fetch(url, {
    headers: {
      "user-agent":
        "SupercoreIndustrialCatalogBot/1.0 (+partner catalog sync)",
    },
  })
  if (!res.ok) {
    throw new Error(`Download failed ${res.status}: ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(dest, buf)
  return dest
}

function absUrl(href) {
  if (!href) return null
  if (href.startsWith("http")) return href
  if (href.startsWith("//")) return `https:${href}`
  if (href.startsWith("/")) return `${BASE}${href}`
  return `${BASE}/${href}`
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function extractProductLinks(html, areaPrefix) {
  const re = new RegExp(
    `href="(/products/${areaPrefix}/[^"#?]+)"`,
    "gi"
  )
  const skip = new Set([
    `/products/${areaPrefix}`,
    `/products/${areaPrefix}/`,
  ])
  const categorySlugs = new Set(
    CATEGORY_PAGES.filter((c) =>
      c.url.includes(`/products/${areaPrefix}/`)
    ).map((c) => c.url.replace(BASE, ""))
  )

  const links = new Set()
  let match
  while ((match = re.exec(html))) {
    const href = match[1]
    if (skip.has(href) || categorySlugs.has(href)) continue
    // Skip pure category folder pages that end with known category segments only
    const parts = href.split("/").filter(Boolean)
    if (parts.length < 3) continue
    links.add(href)
  }
  return [...links]
}

function extractBetween(html, startRe, endRe) {
  const start = html.search(startRe)
  if (start < 0) return ""
  const rest = html.slice(start)
  const end = rest.search(endRe)
  return end > 0 ? rest.slice(0, end) : rest.slice(0, 8000)
}

function cleanText(value) {
  return String(value || "")
    .replace(/&NoBreak;/gi, "")
    .replace(/⁠/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Only the product hero / gallery for THIS product — never related-product
 * thumbs from "Other available models" / accessories sections.
 */
function extractProductImages(html) {
  // Cut page at sections that introduce other products
  const cutAt = html.search(
    /<h3[^>]*>\s*(Other available models|Models|Washer systems|Complete the solution)/i
  )
  const heroRegion =
    cutAt > 0
      ? html.slice(0, cutAt)
      : extractBetween(html, /<h1/i, /<h3[^>]*>\s*(Description|Features)/i) ||
        html

  const urls = []
  const seen = new Set()
  const push = (href) => {
    const abs = absUrl(href)
    if (!abs || seen.has(abs)) return
    if (/icona-|market\d|logo/i.test(abs)) return
    seen.add(abs)
    urls.push(abs)
  }

  // Primary: img-fluid product shot(s) in the hero region
  const fluidRe =
    /<img[^>]+(?:class="[^"]*img-fluid[^"]*"[^>]*src="([^"]+)"|src="([^"]+)"[^>]*class="[^"]*img-fluid[^"]*")[^>]*>/gi
  let m
  while ((m = fluidRe.exec(heroRegion))) {
    const src = m[1] || m[2]
    if (src && /\/images\/products\//i.test(src)) push(src)
  }

  if (!urls.length) {
    const og = html.match(/property="og:image"\s+content="([^"]+)"/i)
    if (og) push(og[1])
  }

  // Cap at a few real gallery frames for the same product (not related items)
  return urls.slice(0, 4)
}

function extractDescription(html) {
  // Live site: <h3>Description</h3><p>...</p>
  const h3Match = html.match(
    /<h3[^>]*>\s*Description\s*<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/i
  )
  if (h3Match) {
    return cleanText(stripTags(h3Match[1])).slice(0, 6000)
  }

  const descBlock = extractBetween(
    html,
    /id=["']description["']/i,
    /id=["'](features|documents|certifications|models)["']/i
  )
  const fromId = cleanText(stripTags(descBlock)).slice(0, 6000)
  if (fromId) return fromId

  return ""
}

function parseProductPage(html, url, meta) {
  const titleMatch =
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
    html.match(/property="og:title"\s+content="([^"]+)"/i)
  const rawTitle = cleanText(
    titleMatch ? stripTags(titleMatch[1] || titleMatch[0]) : path.basename(url)
  )

  const subtitleMatch =
    html.match(/<h1[\s\S]*?<\/h1>\s*<h4[^>]*>([\s\S]*?)<\/h4>/i) ||
    html.match(
      /<h1[\s\S]*?<\/h1>\s*<p[^>]*class="[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    )
  const subtitle = subtitleMatch ? cleanText(stripTags(subtitleMatch[1])) : ""

  const description = extractDescription(html) || subtitle

  const images = extractProductImages(html)

  const datasheets = []
  const pdfRe =
    /href="(\/pdf\/[^"]+\.pdf)"[^>]*>\s*(?:<i[^>]*><\/i>\s*)?([^<]+)/gi
  let pdfMatch
  while ((pdfMatch = pdfRe.exec(html))) {
    datasheets.push({
      url: absUrl(pdfMatch[1]),
      label: stripTags(pdfMatch[2]),
      filename: path.basename(pdfMatch[1]),
    })
  }

  const features = []
  // Prefer Features list items (accurate), fall back to icon alt text
  const featuresBlock = extractBetween(
    html,
    /<h3[^>]*>\s*Features\s*<\/h3>/i,
    /<h3[^>]*>/i
  )
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let liMatch
  while ((liMatch = liRe.exec(featuresBlock))) {
    const text = cleanText(stripTags(liMatch[1]))
    if (text) features.push(text)
  }
  if (!features.length) {
    const featureRe = /icona-feature[^"]*"[^>]*alt="([^"]+)"/gi
    let fMatch
    while ((fMatch = featureRe.exec(html))) {
      features.push(fMatch[1].trim())
    }
  }

  const certifications = []
  const certRe =
    /icona-certification[^"]*"[^>]*alt="([^"]+)"/gi
  let cMatch
  while ((cMatch = certRe.exec(html))) {
    certifications.push(cMatch[1].trim())
  }

  const seriesCodes = [...rawTitle.matchAll(/[A-Z]{2,}[A-Z0-9\-]*/g)]
    .map((m) => cleanText(m[0].replace(/\/.*/, "")))
    .filter(
      (code) =>
        code.length >= 3 && !["ATEX", "LED", "PTZ", "IR", "POE"].includes(code)
    )

  const primaryCode = (
    seriesCodes[0] ||
    path
      .basename(url)
      .replace(/-(ptz|fixed|thermal|washer|junction).*$/i, "")
      .toUpperCase()
  ).replace(/-+$/g, "")

  const slug = path.basename(new URL(url).pathname)

  return {
    slug,
    url,
    area: meta.area,
    category: meta.category,
    category_handle: meta.handle,
    series: primaryCode,
    title: rawTitle,
    subtitle,
    description,
    features: features.map(cleanText),
    certifications: certifications.map(cleanText),
    images,
    datasheets: datasheets.map((d) => ({
      ...d,
      label: cleanText(d.label),
    })),
    models: [],
  }
}

function extractModelsFromPdfBuffer(_buf, _seriesHint) {
  // PDF binary text extraction is unreliable (font metadata false positives).
  // Series-level SKUs are written by the rebuild script; partner expands model rows.
  return []
}

function csvEscape(value) {
  const s = String(value ?? "")
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function originalNameFromUrl(url) {
  try {
    return path.basename(new URL(url).pathname) || "file.bin"
  } catch {
    return "file.bin"
  }
}

async function clearDirFiles(dir) {
  try {
    for (const name of await readdir(dir)) {
      await unlink(path.join(dir, name))
    }
  } catch {
    // ignore
  }
}

async function writeWebsiteProduct(product, localAssets) {
  const areaFolder =
    product.area === "hazardous" ? "hazardous-area" : "safe-area"
  const folder = path.join(
    WEBSITE_ROOT,
    areaFolder,
    product.category_handle,
    product.slug
  )
  await mkdir(path.join(folder, "images", "hero"), { recursive: true })
  await mkdir(path.join(folder, "images", "gallery"), { recursive: true })
  await mkdir(path.join(folder, "documents", "datasheet"), { recursive: true })
  await mkdir(path.join(folder, "documents", "manuals"), { recursive: true })
  await mkdir(path.join(folder, "documents", "certificates"), { recursive: true })

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
    category_path: `${areaFolder}/${product.category_handle}`,
    area: product.area,
    source_url: product.url,
    features: product.features,
    certifications: product.certifications,
    models: product.models,
    images: localAssets.images,
    documents: localAssets.datasheets,
    scraped_at: new Date().toISOString(),
  }

  await writeFile(
    path.join(folder, "product.json"),
    JSON.stringify(productJson, null, 2) + "\n",
    "utf8"
  )

  return folder
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  await mkdir(path.join(WEBSITE_ROOT, "_mapping"), { recursive: true })

  const productMap = new Map()

  for (const cat of CATEGORY_PAGES) {
    console.log(`[tecnovideo] category ${cat.area}/${cat.category}`)
    let html
    try {
      html = await fetchText(cat.url)
    } catch (err) {
      console.warn(`  skip category: ${err.message}`)
      continue
    }

    const areaPrefix = cat.area === "hazardous" ? "atex-hazardous-area" : "safe-area"
    const links = extractProductLinks(html, areaPrefix)
    console.log(`  found ${links.length} product links`)

    for (const href of links) {
      const url = absUrl(href)
      if (productMap.has(url)) {
        continue
      }
      try {
        await sleep(250)
        const pageHtml = await fetchText(url)
        const product = parseProductPage(pageHtml, url, cat)
        productMap.set(url, product)
        console.log(`  + ${product.series} — ${product.title}`)
      } catch (err) {
        console.warn(`  ! ${url}: ${err.message}`)
      }
    }
  }

  const products = [...productMap.values()]
  console.log(`[tecnovideo] downloading assets for ${products.length} products`)

  for (const product of products) {
    const areaFolder =
      product.area === "hazardous" ? "hazardous-area" : "safe-area"
    const folder = path.join(
      WEBSITE_ROOT,
      areaFolder,
      product.category_handle,
      product.slug
    )
    await mkdir(path.join(folder, "images", "hero"), { recursive: true })
    await mkdir(path.join(folder, "images", "gallery"), { recursive: true })
    await mkdir(path.join(folder, "documents", "datasheet"), { recursive: true })
    await clearDirFiles(path.join(folder, "images", "hero"))
    await clearDirFiles(path.join(folder, "images", "gallery"))
    await clearDirFiles(path.join(folder, "documents", "datasheet"))

    const localImages = []
    for (const [index, imageUrl] of product.images.entries()) {
      try {
        const filename = originalNameFromUrl(imageUrl)
        const sub = index === 0 ? "images/hero" : "images/gallery"
        const dest = path.join(folder, sub, filename)
        await downloadFile(imageUrl, dest, { force: true })
        localImages.push({
          role: index === 0 ? "hero" : "gallery",
          source_url: imageUrl,
          filename,
          local_path: path.relative(BACKEND_ROOT, dest).replace(/\\/g, "/"),
        })
        await sleep(200)
      } catch (err) {
        console.warn(`  image fail ${imageUrl}: ${err.message}`)
      }
    }

    const localDatasheets = []
    for (const sheet of product.datasheets) {
      try {
        const filename = sheet.filename || originalNameFromUrl(sheet.url)
        const dest = path.join(folder, "documents", "datasheet", filename)
        await downloadFile(sheet.url, dest, { force: true })
        localDatasheets.push({
          ...sheet,
          filename,
          local_path: path.relative(BACKEND_ROOT, dest).replace(/\\/g, "/"),
        })
        await sleep(200)
      } catch (err) {
        console.warn(`  pdf fail ${sheet.url}: ${err.message}`)
      }
    }

    if (!product.models.length) {
      product.models = [
        {
          sku: product.series,
          title: product.title,
        },
      ]
    }

    await writeWebsiteProduct(product, {
      images: localImages,
      datasheets: localDatasheets,
    })
  }

  const source = {
    source: BASE,
    scraped_at: new Date().toISOString(),
    areas: ["hazardous", "safe"],
    product_count: products.length,
    model_count: products.reduce((n, p) => n + p.models.length, 0),
    products,
  }

  await writeFile(MAPPING_SOURCE, JSON.stringify(source, null, 2), "utf8")

  const rows = [
    [
      "sku",
      "title",
      "description",
      "price",
      "eur_price",
      "category",
      "mpn",
      "source_currency",
      "area",
      "series",
      "source_url",
      "datasheet_url",
      "image_url",
      "notes",
    ],
  ]

  for (const product of products) {
    for (const model of product.models) {
      rows.push([
        model.sku,
        model.title || product.title,
        product.description || product.subtitle || "",
        "",
        "",
        `${product.area === "hazardous" ? "Hazardous Area" : "Safe Area"} > ${product.category}`,
        model.sku,
        "eur",
        product.area,
        product.series,
        product.url,
        product.datasheets[0]?.url || "",
        product.images[0] || "",
        "PRICE_PENDING",
      ])
    }
  }

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n"
  await writeFile(path.join(OUT_DIR, "tecnovideo-pricelist-eur.csv"), csv, "utf8")

  await writeFile(
    path.join(OUT_DIR, "README.md"),
    `# Tecnovideo (imports — price list only)

Source: ${BASE}

## This folder

- \`tecnovideo-pricelist-eur.csv\` — EUR price skeleton (**fill prices**, then import)

## Media & product folders (not here)

Canonical product folders / images / datasheets live under:

\`data/website sources/Products/{hazardous-area|safe-area}/{category}/{slug}/\`

Catalog index: \`data/website sources/Products/_mapping/tecnovideo-catalog-source.json\`

Refresh:

\`\`\`bash
node scripts/refresh-tecnovideo-content.mjs
node scripts/rebuild-tecnovideo-pricelist.mjs
\`\`\`

Scraped at: ${source.scraped_at}
Products: ${source.product_count}
`,
    "utf8"
  )

  console.log(
    `[tecnovideo] done: products=${source.product_count} models=${source.model_count}`
  )
  console.log(`[tecnovideo] CSV: ${path.join(OUT_DIR, "tecnovideo-pricelist-eur.csv")}`)
  console.log(`[tecnovideo] catalog: ${MAPPING_SOURCE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
