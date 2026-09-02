import { existsSync, readFileSync } from "fs"
import path from "path"
import { sanitizeCatalogSlug } from "./catalog-permalink"

export type CatalogHandleLookup = {
  slugForSku(manufacturerId: string, sku?: string | null): string | null
}

function skuKey(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
}

export function resolveProductsRoot(cwd = process.cwd()) {
  const candidates = [
    path.resolve(cwd, "data/website sources/Products"),
    path.resolve(cwd, "apps/backend/data/website sources/Products"),
  ]
  return (
    candidates.find((candidate) =>
      existsSync(path.join(candidate, "_index.json"))
    ) || candidates[0]
  )
}

export function loadCatalogHandleLookup(
  productsRoot = resolveProductsRoot()
): CatalogHandleLookup {
  const bySku = new Map<string, string>()
  const indexPath = path.join(productsRoot, "_index.json")
  if (!existsSync(indexPath)) {
    return { slugForSku: () => null }
  }

  const index = JSON.parse(readFileSync(indexPath, "utf8")) as {
    products?: Array<{
      slug?: string
      sku?: string | null
      manufacturer?: string | null
    }>
  }

  for (const row of index.products || []) {
    const manufacturer = String(row.manufacturer || "").toLowerCase()
    const sku = skuKey(row.sku)
    const slug = sanitizeCatalogSlug(row.slug)
    if (!manufacturer || !sku || !slug) {
      continue
    }
    const key = `${manufacturer}:${sku}`
    if (!bySku.has(key)) {
      bySku.set(key, slug)
    }
  }

  return {
    slugForSku(manufacturerId, sku) {
      return bySku.get(`${String(manufacturerId).toLowerCase()}:${skuKey(sku)}`) ?? null
    },
  }
}
