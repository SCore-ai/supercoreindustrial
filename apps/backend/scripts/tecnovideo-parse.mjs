/**
 * Shared Tecnovideo product-page parsers (CDN HTML → description + hero images).
 */

import path from "node:path"

export const BASE = "https://www.tecnovideocctv.com"

export function absUrl(href) {
  if (!href) return null
  if (href.startsWith("http")) return href
  if (href.startsWith("//")) return `https:${href}`
  if (href.startsWith("/")) return `${BASE}${href}`
  return `${BASE}/${href}`
}

export function stripTags(html) {
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

export function extractBetween(html, startRe, endRe) {
  const start = html.search(startRe)
  if (start < 0) return ""
  const rest = html.slice(start)
  const end = rest.search(endRe)
  return end > 0 ? rest.slice(0, end) : rest.slice(0, 8000)
}

export function cleanText(value) {
  return String(value || "")
    .replace(/&NoBreak;/gi, "")
    .replace(/⁠/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Only this product's hero / gallery — never related-product thumbs.
 */
export function extractProductImages(html) {
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

  return urls.slice(0, 4)
}

export function extractDescription(html) {
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
  return fromId || ""
}

export function parseProductPage(html, url, meta = {}) {
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
  const certRe = /icona-certification[^"]*"[^>]*alt="([^"]+)"/gi
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
