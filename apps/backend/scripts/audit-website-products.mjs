import fs from "fs"
import path from "path"

const ROOT = path.resolve("data/website sources/Products")
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"])
const DOC_EXT = new Set([".pdf", ".rtf", ".doc", ".docx"])
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
const RESERVED = new Set([
  "_mapping",
  "_unmapped",
  "_legacy",
  "_shared",
  "_cache",
])

function list(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
}

function walk(dir, visitFile, visitDir) {
  for (const entry of list(dir)) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      visitDir?.(full, entry.name)
      if (!(dir === ROOT && entry.name.startsWith("_"))) {
        walk(full, visitFile, visitDir)
      } else if (entry.name === "_unmapped") {
        walk(full, visitFile, visitDir)
      }
    } else {
      visitFile?.(full, entry.name)
    }
  }
}

const idx = JSON.parse(fs.readFileSync(path.join(ROOT, "_index.json"), "utf8"))
const treeCsv = fs.readFileSync(
  path.join(ROOT, "_mapping/category-tree.csv"),
  "utf8"
)
const treeHandles = new Set(
  treeCsv
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split(",")[1])
)

const categoryDirs = []
const leftoverRoot = []
for (const entry of list(ROOT)) {
  if (!entry.isDirectory()) continue
  if (RESERVED.has(entry.name) || entry.name.startsWith("_")) {
    leftoverRoot.push(entry.name)
    continue
  }
  const cat = path.join(ROOT, entry.name, "_category.json")
  if (fs.existsSync(cat)) categoryDirs.push(entry.name)
  else leftoverRoot.push(entry.name)
}

const productFiles = []
function collectProductJson(dir) {
  for (const entry of list(dir)) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (dir === ROOT && entry.name.startsWith("_") && entry.name !== "_unmapped") {
        continue
      }
      collectProductJson(full)
    } else if (entry.name === "product.json") {
      productFiles.push(full)
    }
  }
}
collectProductJson(ROOT)

const products = productFiles.map((file) => {
  const meta = JSON.parse(fs.readFileSync(file, "utf8"))
  const dir = path.dirname(file)
  const rel = path.relative(ROOT, dir).split(path.sep).join("/")
  const assets = {}
  let imageCount = 0
  let pdfCount = 0
  let missingScaffold = []
  for (const relDir of ASSET_DIRS) {
    const abs = path.join(dir, ...relDir.split("/"))
    if (!fs.existsSync(abs)) missingScaffold.push(relDir)
    else {
      const files = list(abs).filter((e) => e.isFile()).map((e) => e.name)
      assets[relDir] = files
      for (const name of files) {
        const ext = path.extname(name).toLowerCase()
        if (IMAGE_EXT.has(ext)) imageCount += 1
        if (DOC_EXT.has(ext)) pdfCount += 1
      }
    }
  }
  return {
    slug: meta.slug,
    sku: meta.sku,
    manufacturer: meta.manufacturer,
    title: meta.title,
    handle: meta.category_handle,
    path: meta.category_path,
    folder: rel,
    reason: meta.mapping_reason,
    pathMatch: rel === `${meta.category_path}/${meta.slug}` || rel === meta.category_path,
    imageCount,
    pdfCount,
    hasHero: (assets["images/hero"] || []).length > 0,
    hasDatasheet:
      (assets["documents/datasheet"] || []).length > 0 ||
      (assets["documents/ae-spec"] || []).length > 0,
    missingScaffold,
  }
})

const byHandle = {}
const onParent = []
const mismatched = []
const missingScaffold = []
let withImage = 0
let withDatasheet = 0
const byMfr = {}

const leafByHandle = new Map()
for (const line of treeCsv.split(/\r?\n/).slice(1).filter(Boolean)) {
  const cols = []
  let cur = ""
  let q = false
  for (const ch of line) {
    if (ch === '"') q = !q
    else if (ch === "," && !q) {
      cols.push(cur)
      cur = ""
    } else cur += ch
  }
  cols.push(cur)
  leafByHandle.set(cols[1], cols[5] === "yes")
}

for (const p of products) {
  byHandle[p.handle] = (byHandle[p.handle] || 0) + 1
  byMfr[p.manufacturer || "unknown"] = (byMfr[p.manufacturer || "unknown"] || 0) + 1
  if (p.imageCount) withImage += 1
  if (p.pdfCount) withDatasheet += 1
  if (leafByHandle.get(p.handle) === false) {
    onParent.push(p)
  }
  if (!p.pathMatch) mismatched.push(p)
  if (p.missingScaffold.length) missingScaffold.push(p)
}

const extraCategoryFolders = []
walk(
  ROOT,
  null,
  (full, name) => {
    if (name.startsWith("_")) return
    const cat = path.join(full, "_category.json")
    if (fs.existsSync(cat)) {
      const json = JSON.parse(fs.readFileSync(cat, "utf8"))
      if (!treeHandles.has(json.handle)) extraCategoryFolders.push(json.handle)
    }
  }
)

const reservedStats = {}
for (const name of leftoverRoot) {
  const dir = path.join(ROOT, name)
  let files = 0
  let dirs = 0
  const walkRes = (d) => {
    for (const e of list(d)) {
      if (e.isDirectory()) {
        dirs += 1
        walkRes(path.join(d, e.name))
      } else files += 1
    }
  }
  if (fs.existsSync(dir)) walkRes(dir)
  reservedStats[name] = { files, dirs }
}

const parentReasons = {}
for (const p of onParent) {
  const key = `${p.handle}|${p.reason}`
  parentReasons[key] = (parentReasons[key] || 0) + 1
}

const report = {
  products: products.length,
  category_nodes: treeHandles.size,
  root_category_dirs: categoryDirs.sort(),
  leftover_root: leftoverRoot,
  reserved: reservedStats,
  extra_category_folders: extraCategoryFolders,
  by_manufacturer: byMfr,
  by_handle: Object.fromEntries(
    Object.entries(byHandle).sort((a, b) => b[1] - a[1])
  ),
  on_parent_count: onParent.length,
  on_parent_reasons: parentReasons,
  mismatched: mismatched.map((p) => ({ slug: p.slug, folder: p.folder, path: p.path })),
  missing_scaffold: missingScaffold.length,
  with_image: withImage,
  with_datasheet: withDatasheet,
  without_image: products.length - withImage,
  without_datasheet: products.length - withDatasheet,
  sample_parent: onParent.slice(0, 12).map((p) => ({
    slug: p.slug,
    handle: p.handle,
    reason: p.reason,
    title: p.title,
  })),
}

fs.writeFileSync(
  path.join(ROOT, "_mapping/structure-audit.json"),
  JSON.stringify(report, null, 2) + "\n"
)
console.log(JSON.stringify({
  products: report.products,
  leftover_root: report.leftover_root,
  reserved: report.reserved,
  extra_category_folders: report.extra_category_folders,
  on_parent_count: report.on_parent_count,
  mismatched: report.mismatched.length,
  missing_scaffold: report.missing_scaffold,
  with_image: report.with_image,
  with_datasheet: report.with_datasheet,
  by_manufacturer: report.by_manufacturer,
  top_handles: Object.entries(report.by_handle).slice(0, 20),
  parent_reasons: report.on_parent_reasons,
}, null, 2))
