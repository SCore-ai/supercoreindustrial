import fs from "fs"
import path from "path"
import {
  SUPERCORE_CATEGORY_TREE,
  type CategorySeed,
} from "../src/lib/seed/supercore-category-tree"
import {
  inferManufacturerId,
  mapManufacturerCategory,
} from "../src/lib/catalog/category-mapping"
import {
  isEolLifecycle,
  isLegacyDevicePlacement,
  LEGACY_DEVICES_HANDLE,
  legacyProductFields,
} from "../src/lib/catalog/legacy-devices"
const PRODUCTS_ROOT = path.resolve(
  __dirname,
  "../data/website sources/Products"
)

const PRICELIST_FILES = [
  "../data/imports/Axis/axis-pricelist-august-2026-merged-eur-gbp.csv",
  "../data/imports/Zenitel/zenitel-safety-security-pricelist-2026-eur.csv",
  "../data/imports/Zenitel/zenitel-safety-security-spare-parts-2026-eur.csv",
  "../data/imports/Zenitel/zenitel-maritime-energy-pricelist-q2-2026-eur.csv",
  "../data/imports/Tecnovideo/tecnovideo-pricelist-eur.csv",
  "../data/imports/Spectrum/spectrum-pricelist-usd.csv",
]

function parseCsvLine(line: string) {
  const out: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === "," && !inQuotes) {
      out.push(current)
      current = ""
      continue
    }
    current += ch
  }
  out.push(current)
  return out
}

function loadPricelistHints() {
  const hints = new Map<string, string>()
  for (const rel of PRICELIST_FILES) {
    const file = path.resolve(__dirname, rel)
    if (!fs.existsSync(file)) {
      continue
    }
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean)
    if (!lines.length) {
      continue
    }
    const header = parseCsvLine(lines[0]).map((value) => value.trim().toLowerCase())
    const skuIdx = header.indexOf("sku")
    const categoryIdx = header.indexOf("category")
    if (skuIdx < 0 || categoryIdx < 0) {
      continue
    }
    for (const line of lines.slice(1)) {
      const cols = parseCsvLine(line)
      const sku = cols[skuIdx]?.trim()
      const category = cols[categoryIdx]?.trim()
      if (sku && category && category.toLowerCase() !== "axis") {
        hints.set(sku, category)
      }
    }
  }
  return hints
}

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

type NodeInfo = {
  name: string
  handle: string
  folderPath: string
  parentHandle: string | null
  isLeaf: boolean
}

type ProductMeta = {
  slug: string
  sku?: string | null
  manufacturer?: string | null
  title?: string
  category_handle?: string
  category_path?: string
  mapping_reason?: string
  [key: string]: unknown
}

function posixJoin(...parts: string[]) {
  return parts.filter(Boolean).join("/")
}

function flattenTree(
  tree: CategorySeed[],
  parentPath = "",
  parentHandle: string | null = null,
  acc: Map<string, NodeInfo> = new Map()
) {
  for (const node of tree) {
    const folderPath = posixJoin(parentPath, node.handle)
    acc.set(node.handle, {
      name: node.name,
      handle: node.handle,
      folderPath,
      parentHandle,
      isLeaf: !node.children?.length,
    })
    if (node.children?.length) {
      flattenTree(node.children, folderPath, node.handle, acc)
    }
  }
  return acc
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true })
}

function listDirs(dir: string) {
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

function collectProductJson(dir: string, acc: string[] = []) {
  if (!fs.existsSync(dir)) {
    return acc
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        dir === PRODUCTS_ROOT &&
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

function moveDir(src: string, dest: string) {
  if (src === dest) {
    return
  }
  ensureDir(path.dirname(dest))
  if (!fs.existsSync(dest)) {
    try {
      fs.renameSync(src, dest)
      return
    } catch {
      mergeDir(src, dest)
      fs.rmSync(src, { recursive: true, force: true })
      return
    }
  }
  mergeDir(src, dest)
  fs.rmSync(src, { recursive: true, force: true })
}

function mergeDir(src: string, dest: string) {
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      mergeDir(from, to)
    } else if (!fs.existsSync(to)) {
      fs.copyFileSync(from, to)
    }
  }
}

function ensureAssetScaffold(productDir: string) {
  for (const rel of ASSET_DIRS) {
    ensureDir(path.join(productDir, rel))
  }
}

const RESERVED_ROOTS = new Set([
  "_mapping",
  "_unmapped",
  "_cache",
])

function removeGitkeep(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name.startsWith("_") && dir === PRODUCTS_ROOT) {
        continue
      }
      removeGitkeep(full)
    } else if (entry.name === ".gitkeep") {
      fs.unlinkSync(full)
    }
  }
}

function pruneEmptyDirs(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return true
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let empty = true
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const childEmpty = pruneEmptyDirs(full)
      if (!childEmpty) {
        empty = false
      }
    } else if (entry.name !== ".gitkeep") {
      empty = false
    }
  }
  const isReserved =
    dir === PRODUCTS_ROOT ||
    RESERVED_ROOTS.has(path.basename(dir)) ||
    fs.existsSync(path.join(dir, "_category.json"))
  if (empty && !isReserved) {
    fs.rmSync(dir, { recursive: true, force: true })
    return true
  }
  return isReserved ? false : empty
}

function writeCategoryFiles(nodes: Map<string, NodeInfo>) {
  for (const node of nodes.values()) {
    const dir = path.join(PRODUCTS_ROOT, ...node.folderPath.split("/"))
    ensureDir(dir)
    fs.writeFileSync(
      path.join(dir, "_category.json"),
      JSON.stringify(
        {
          name: node.name,
          handle: node.handle,
          path: node.folderPath,
          parent: node.parentHandle,
          is_leaf: node.isLeaf,
        },
        null,
        2
      ) + "\n"
    )
  }
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function loadTecnovideoHandles() {
  const file = path.resolve(
    __dirname,
    "../data/website sources/Products/_mapping/tecnovideo-catalog-source.json"
  )
  const map = new Map<string, string>()
  if (!fs.existsSync(file)) {
    return map
  }
  const json = JSON.parse(fs.readFileSync(file, "utf8")) as {
    products?: Array<{ slug?: string; category_handle?: string }>
  }
  for (const product of json.products ?? []) {
    if (product.slug && product.category_handle) {
      map.set(product.slug, product.category_handle)
    }
  }
  return map
}

function main() {
  ensureDir(PRODUCTS_ROOT)
  ensureDir(path.join(PRODUCTS_ROOT, "_mapping"))
  ensureDir(path.join(PRODUCTS_ROOT, "_unmapped"))

  const nodes = flattenTree(SUPERCORE_CATEGORY_TREE)
  writeCategoryFiles(nodes)
  removeGitkeep(PRODUCTS_ROOT)

  const hints = loadPricelistHints()
  const tecnovideoHandles = loadTecnovideoHandles()
  const productFiles = collectProductJson(PRODUCTS_ROOT)
  const products: ProductMeta[] = []
  const mappingRows: string[] = [
    [
      "kind",
      "slug",
      "sku",
      "manufacturer",
      "title",
      "category_handle",
      "category_path",
      "folder",
      "mapping_reason",
      "moved",
    ].join(","),
  ]

  let moved = 0

  for (const file of productFiles) {
    const currentDir = path.dirname(file)
    const meta = JSON.parse(fs.readFileSync(file, "utf8")) as ProductMeta
    const manufacturer =
      inferManufacturerId({
        handle: String(meta.medusa_handle ?? meta.slug ?? ""),
        manufacturerId: meta.manufacturer,
        manufacturer: meta.manufacturer,
      }) ?? meta.manufacturer ?? null

    const csvHint = meta.sku ? hints.get(String(meta.sku)) : undefined
    const legacyHint = Array.isArray(meta.legacy_paths)
      ? meta.legacy_paths.filter(Boolean).join(" > ")
      : ""
    const categoryHint = [csvHint, legacyHint].filter(Boolean).join(" > ") || undefined
    const mapped = mapManufacturerCategory({
      manufacturerId: manufacturer ?? "",
      title: meta.title ?? meta.slug,
      sku: meta.sku,
      categoryHint,
    })

    const folderPath = path
      .relative(PRODUCTS_ROOT, currentDir)
      .split(path.sep)
      .join("/")

    let handle = mapped.skip || !mapped.handle ? "_unmapped" : mapped.handle
    let reason = mapped.reason
    const tecnovideoHandle = tecnovideoHandles.get(
      meta.slug || path.basename(currentDir)
    )
    if (
      String(manufacturer ?? "").toLowerCase() === "tecnovideo" &&
      tecnovideoHandle &&
      nodes.has(tecnovideoHandle)
    ) {
      handle = tecnovideoHandle
      reason = "tecnovideo-catalog"
    }
    if (
      isLegacyDevicePlacement({
        categoryHandle: meta.category_handle,
        lifecycle: meta.lifecycle,
        folderPath,
      })
    ) {
      handle = LEGACY_DEVICES_HANDLE
      reason = `${reason}|${
        isEolLifecycle(meta.lifecycle) ? "legacy-eol" : "legacy-devices-folder"
      }`
    } else if (handle !== "_unmapped" && !nodes.has(handle)) {
      handle = "_unmapped"
      reason = `${reason}|unknown-handle`
    }

    const node = nodes.get(handle)
    const categoryPath = node?.folderPath ?? "_unmapped"
    const slug = meta.slug || path.basename(currentDir)
    const destDir = path.join(PRODUCTS_ROOT, ...categoryPath.split("/"), slug)
    const didMove = path.resolve(currentDir) !== path.resolve(destDir)

    if (didMove) {
      moveDir(currentDir, destDir)
      moved += 1
    }

    const productDir = fs.existsSync(destDir) ? destDir : currentDir
    ensureAssetScaffold(productDir)

    const next: ProductMeta = {
      ...meta,
      slug,
      manufacturer: manufacturer ?? meta.manufacturer ?? null,
      category_handle: handle,
      category_path: categoryPath,
      mapping_reason: reason,
      ...(handle === LEGACY_DEVICES_HANDLE
        ? legacyProductFields(meta, mapped.handle)
        : {}),
    }
    fs.writeFileSync(
      path.join(productDir, "product.json"),
      JSON.stringify(next, null, 2) + "\n"
    )
    products.push(next)

    mappingRows.push(
      [
        "product",
        csvEscape(slug),
        csvEscape(String(next.sku ?? "")),
        csvEscape(String(next.manufacturer ?? "")),
        csvEscape(String(next.title ?? "")),
        csvEscape(handle),
        csvEscape(categoryPath),
        csvEscape(
          path
            .relative(PRODUCTS_ROOT, productDir)
            .split(path.sep)
            .join("/")
        ),
        csvEscape(reason),
        didMove ? "yes" : "no",
      ].join(",")
    )
  }

  const byHandle: Record<string, number> = {}
  for (const product of products) {
    const key = String(product.category_handle)
    byHandle[key] = (byHandle[key] || 0) + 1
  }

  const categoryRows = [
    "kind,handle,name,path,parent,is_leaf,product_count",
    ...[...nodes.values()].map((node) =>
      [
        "category",
        node.handle,
        csvEscape(node.name),
        node.folderPath,
        node.parentHandle ?? "",
        node.isLeaf ? "yes" : "no",
        String(byHandle[node.handle] ?? 0),
      ].join(",")
    ),
  ]

  fs.writeFileSync(
    path.join(PRODUCTS_ROOT, "_mapping", "category-tree.csv"),
    categoryRows.join("\n") + "\n"
  )
  fs.writeFileSync(
    path.join(PRODUCTS_ROOT, "_mapping", "category-mapping.csv"),
    mappingRows.join("\n") + "\n"
  )
  pruneEmptyDirs(PRODUCTS_ROOT)
  writeCategoryFiles(nodes)
  for (const product of products) {
    const productDir = path.join(
      PRODUCTS_ROOT,
      ...String(product.category_path ?? "_unmapped").split("/"),
      product.slug
    )
    if (fs.existsSync(productDir)) {
      ensureAssetScaffold(productDir)
    }
  }

  fs.writeFileSync(
    path.join(PRODUCTS_ROOT, "_index.json"),
    JSON.stringify(
      {
        master: "SUPERCORE_CATEGORY_TREE",
        generated_at: new Date().toISOString(),
        product_count: products.length,
        moved,
        by_category: byHandle,
        products: products.map((product) => ({
          slug: product.slug,
          sku: product.sku,
          manufacturer: product.manufacturer,
          title: product.title,
          category_handle: product.category_handle,
          category_path: product.category_path,
          mapping_reason: product.mapping_reason,
        })),
      },
      null,
      2
    ) + "\n"
  )

  console.log(
    JSON.stringify(
      {
        products: products.length,
        moved,
        categories: nodes.size,
        top_categories: Object.entries(byHandle)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15),
      },
      null,
      2
    )
  )
}

main()
