import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow, deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"
import { mapManufacturerCategory } from "./category-mapping"
import { medusaCategoryHandle } from "./medusa-category-assignment"
import { isLegacyMedusaProduct } from "./legacy-devices"
import {
  buildProductOptions,
  groupItemsByParent,
  variantOptionMap,
  variantTitle,
} from "./import-grouping"
import { ensureManufacturerCollection } from "./manufacturer-collections"
import {
  requireManufacturer,
  type ManufacturerDefinition,
  type ManufacturerId,
} from "./manufacturers"
import { loadCatalogHandleLookup } from "./catalog-handle-lookup"
import {
  resolveProductHandle,
  skuProductHandle,
} from "./catalog-permalink"
import {
  mapZenitelRows,
  parseCsv,
  type ZenitelParsedItem,
} from "./zenitel-parser"

export type ManufacturerPreviewRow = ZenitelParsedItem & {
  gbp_price: number
  eur_price: number
  usd_price: number
  fx_rate: number
  /** @deprecated use fx_rate — kept for existing admin UI */
  fx_rate_eur_gbp: number
}

export type ManufacturerPreviewResult = {
  job_id: string
  manufacturer: string
  manufacturer_id: ManufacturerId
  source_currency: string
  target_currency: string
  fx_rate: number
  fx_rate_eur_gbp: number
  total_rows: number
  preview_count: number
  skipped_count: number
  items: ManufacturerPreviewRow[]
  skipped: Array<{ reason: string; sku?: string }>
}

export type ManufacturerImportResult = {
  job_id: string
  manufacturer: string
  manufacturer_id: ManufacturerId
  status: string
  imported_count: number
  skipped_count: number
  error_count: number
  fx_rate: number
  fx_rate_eur_gbp: number
  errors: Array<{ sku: string; message: string }>
}

type FxBundle = {
  sourceToGbp: number
  gbpToEur: number
  gbpToUsd: number
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100
}

/** Medusa v2 stores prices in major currency units (e.g. 10.99 EUR → 10.99). */
function toPriceAmount(major: number) {
  return roundMoney(major)
}

function formatImportError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

function productHandle(
  manufacturer: ManufacturerDefinition,
  sku: string,
  sourceUrl?: string | null,
  catalogSlug?: string | null,
  title?: string | null,
  mpn?: string | null
) {
  return resolveProductHandle({
    manufacturerId: manufacturer.id,
    sku,
    sourceUrl,
    catalogSlug,
    title,
    mpn,
  })
}

function productHandlesForGroup(
  manufacturer: ManufacturerDefinition,
  sku: string,
  sourceUrl?: string | null,
  catalogSlug?: string | null,
  title?: string | null,
  mpn?: string | null
) {
  const next = productHandle(
    manufacturer,
    sku,
    sourceUrl,
    catalogSlug,
    title,
    mpn
  )
  const legacy = skuProductHandle(manufacturer.id, sku)
  return next === legacy ? [next] : [next, legacy]
}

/** Always keep the manufacturer list SKU verbatim — never rewrite/prefix it. */
function variantSku(_manufacturer: ManufacturerDefinition, sku: string) {
  return sku.trim()
}

async function getDefaultSalesChannelId(scope: MedusaContainer) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  return data[0]?.id as string | undefined
}

async function deleteProductsByHandles(
  scope: MedusaContainer,
  handles: string[]
) {
  if (!handles.length) {
    return 0
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const unique = [...new Set(handles)]
  const ids: string[] = []
  const chunk = 50

  for (let i = 0; i < unique.length; i += chunk) {
    const batch = unique.slice(i, i + chunk)
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: {
        handle: { $in: batch },
      },
    })
    for (const product of (data ?? []) as Array<{ id: string }>) {
      ids.push(product.id)
    }
  }

  for (let i = 0; i < ids.length; i += chunk) {
    await deleteProductsWorkflow(scope).run({
      input: { ids: ids.slice(i, i + chunk) },
    })
  }

  return ids.length
}

async function getLegacyProtectedHandles(
  scope: MedusaContainer,
  handles: string[]
) {
  const protectedHandles = new Set<string>()
  if (!handles.length) {
    return protectedHandles
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const unique = [...new Set(handles)]
  const chunk = 50

  for (let i = 0; i < unique.length; i += chunk) {
    const batch = unique.slice(i, i + chunk)
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "metadata", "categories.handle"],
      filters: {
        handle: { $in: batch },
      },
    })
    for (const product of (data ?? []) as Array<{
      handle?: string
      metadata?: Record<string, unknown> | null
      categories?: Array<{ handle?: string | null }> | null
    }>) {
      if (product.handle && isLegacyMedusaProduct(product)) {
        protectedHandles.add(product.handle)
      }
    }
  }

  return protectedHandles
}

async function loadFxBundle(
  catalog: CatalogModuleService,
  sourceCurrency: string
): Promise<FxBundle> {
  const source = sourceCurrency.toLowerCase()
  const [sourceToGbp, gbpToEur, gbpToUsd] = await Promise.all([
    catalog.getRate(source, "gbp"),
    catalog.getRate("gbp", "eur"),
    catalog.getRate("gbp", "usd"),
  ])
  return { sourceToGbp, gbpToEur, gbpToUsd }
}

function convertWithBundle(
  amount: number,
  sourceCurrency: string,
  fx: FxBundle,
  explicit?: {
    eur_price?: number | null
    gbp_price?: number | null
    usd_price?: number | null
  }
) {
  const source = sourceCurrency.toLowerCase()
  const gbpFromSource = roundMoney(amount * fx.sourceToGbp)
  const gbpPrice =
    explicit?.gbp_price != null && explicit.gbp_price >= 0
      ? roundMoney(explicit.gbp_price)
      : gbpFromSource

  const eurPrice =
    explicit?.eur_price != null && explicit.eur_price >= 0
      ? roundMoney(explicit.eur_price)
      : source === "eur"
        ? roundMoney(amount)
        : roundMoney(gbpPrice * fx.gbpToEur)

  const usdPrice =
    explicit?.usd_price != null && explicit.usd_price >= 0
      ? roundMoney(explicit.usd_price)
      : source === "usd"
        ? roundMoney(amount)
        : roundMoney(gbpPrice * fx.gbpToUsd)

  return {
    fx_rate: fx.sourceToGbp,
    gbp_price: gbpPrice,
    eur_price: eurPrice,
    usd_price: usdPrice,
  }
}

export async function previewManufacturerCsv(
  scope: MedusaContainer,
  input: {
    manufacturer: string
    csv: string
    filename?: string
    source_currency?: string
    limit?: number
  }
): Promise<ManufacturerPreviewResult> {
  const manufacturer = requireManufacturer(input.manufacturer)
  const catalog = scope.resolve(CATALOG_MODULE) as CatalogModuleService
  const sourceCurrency = (
    input.source_currency ?? manufacturer.source_currency
  ).toLowerCase()

  const rows = parseCsv(input.csv)
  const mapped = mapZenitelRows(rows, sourceCurrency)
  const fx = await loadFxBundle(catalog, sourceCurrency)

  const enriched: ManufacturerPreviewRow[] = mapped.items.map((item) => {
    const prices = convertWithBundle(item.source_price, sourceCurrency, fx, {
      eur_price: item.eur_price,
      gbp_price: item.gbp_price,
      usd_price: item.usd_price,
    })
    return {
      ...item,
      ...prices,
      fx_rate_eur_gbp: prices.fx_rate,
    }
  })

  const job = await catalog.createImportJob({
    manufacturer: manufacturer.name,
    source_currency: sourceCurrency,
    target_currency: manufacturer.target_currency,
    filename: input.filename ?? manufacturer.default_filename,
    metadata: {
      manufacturer_id: manufacturer.id,
      preview_at: new Date().toISOString(),
    },
  })

  const limit = input.limit ?? 50

  await catalog.updateImportJob(job.id, {
    status: "previewed",
    total_rows: mapped.items.length,
    skipped_count: mapped.skipped.length,
    fx_rate_used: fx.sourceToGbp,
    summary: {
      previewed: Math.min(enriched.length, limit),
      total_valid: enriched.length,
      manufacturer_id: manufacturer.id,
    },
  })

  return {
    job_id: job.id,
    manufacturer: manufacturer.name,
    manufacturer_id: manufacturer.id,
    source_currency: sourceCurrency,
    target_currency: manufacturer.target_currency,
    fx_rate: fx.sourceToGbp,
    fx_rate_eur_gbp: fx.sourceToGbp,
    total_rows: mapped.items.length,
    preview_count: Math.min(enriched.length, limit),
    skipped_count: mapped.skipped.length,
    items: enriched.slice(0, limit),
    skipped: mapped.skipped.slice(0, 20).map((entry) => ({
      reason: entry.reason,
      sku: entry.row.sku || entry.row.SKU || undefined,
    })),
  }
}

export async function runManufacturerImport(
  scope: MedusaContainer,
  input: {
    manufacturer: string
    csv: string
    filename?: string
    source_currency?: string
    job_id?: string
    /** Create products without public prices (Request Quote / Hide Price). */
    quoteOnly?: boolean
  }
): Promise<ManufacturerImportResult> {
  const manufacturer = requireManufacturer(input.manufacturer)
  const catalog = scope.resolve(CATALOG_MODULE) as CatalogModuleService
  const logger = scope.resolve(ContainerRegistrationKeys.LOGGER)
  const quoteOnly = input.quoteOnly === true
  const sourceCurrency = (
    input.source_currency ?? manufacturer.source_currency
  ).toLowerCase()

  const rows = parseCsv(input.csv)
  const mapped = mapZenitelRows(rows, sourceCurrency, {
    allowMissingPrice: quoteOnly,
  })
  const fx = await loadFxBundle(catalog, sourceCurrency)

  let jobId = input.job_id
  if (!jobId) {
    const job = await catalog.createImportJob({
      manufacturer: manufacturer.name,
      source_currency: sourceCurrency,
      target_currency: manufacturer.target_currency,
      filename: input.filename ?? manufacturer.default_filename,
      metadata: { manufacturer_id: manufacturer.id },
    })
    jobId = job.id
  }

  await catalog.updateImportJob(jobId, {
    status: "running",
    total_rows: mapped.items.length,
    fx_rate_used: fx.sourceToGbp,
  })

  const salesChannelId = await getDefaultSalesChannelId(scope)
  const collectionId = await ensureManufacturerCollection(scope, manufacturer)
  if (!salesChannelId) {
    await catalog.updateImportJob(jobId, {
      status: "failed",
      error_log: [{ message: "No sales channel found. Run seed first." }],
    })
    throw new Error("No sales channel found")
  }

  const groups = groupItemsByParent(mapped.items)
  const catalogLookup = loadCatalogHandleLookup()
  const replaceHandles = [
    ...new Set(
      groups.flatMap((group) =>
        productHandlesForGroup(
          manufacturer,
          group.parentSku,
          group.source_url,
          catalogLookup.slugForSku(manufacturer.id, group.parentSku),
          group.title,
          group.items[0]?.mpn
        )
      )
    ),
  ]
  const protectedHandles = await getLegacyProtectedHandles(
    scope,
    replaceHandles
  )
  const replaceableHandles = replaceHandles.filter(
    (handle) => !protectedHandles.has(handle)
  )
  const importGroups = groups.filter(
    (group) =>
      !protectedHandles.has(
        productHandle(
          manufacturer,
          group.parentSku,
          group.source_url,
          catalogLookup.slugForSku(manufacturer.id, group.parentSku),
          group.title,
          group.items[0]?.mpn
        )
      )
  )
  const replaced = await deleteProductsByHandles(scope, replaceableHandles)
  if (replaced) {
    logger.info(
      `[catalog-import] ${manufacturer.name}: replaced ${replaced} existing products before import`
    )
  }
  if (protectedHandles.size) {
    logger.info(
      `[catalog-import] ${manufacturer.name}: kept ${protectedHandles.size} legacy-devices products`
    )
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  })
  const categoryIdByHandle = new Map<string, string>()
  for (const category of categories as Array<{ id: string; handle?: string }>) {
    if (category.handle) {
      categoryIdByHandle.set(category.handle, category.id)
    }
  }

  let imported = 0
  let skipped = mapped.skipped.length + protectedHandles.size
  const errors: Array<{ sku: string; message: string }> = []
  let variantCount = 0

  const productsData = importGroups.map((group) => {
    const representative = group.items[0]
    const { options, isDefault } = buildProductOptions(group.items)
    const optionTitles = options.map((option) => option.title)
    const categoryMap = mapManufacturerCategory({
      manufacturerId: manufacturer.id,
      title: group.title,
      sku: group.parentSku,
      categoryHint: group.category,
    })
    const categoryId =
      categoryMap.handle && !categoryMap.skip
        ? categoryIdByHandle.get(
            medusaCategoryHandle(categoryMap.handle) ?? categoryMap.handle
          )
        : undefined
    const minSourcePrice = Math.min(
      ...group.items.map((item) => item.source_price)
    )
    const minPrices = convertWithBundle(
      quoteOnly ? 0 : minSourcePrice,
      sourceCurrency,
      fx
    )
    const datasheetUrl =
      representative.raw?.datasheet_url ||
      representative.raw?.["Datasheet URL"] ||
      null
    const sourceUrl =
      group.source_url ||
      representative.source_url ||
      representative.raw?.permalink ||
      representative.raw?.source_url ||
      representative.raw?.["Source URL"] ||
      null

    return {
      title: group.title,
      handle: productHandle(
        manufacturer,
        group.parentSku,
        sourceUrl,
        catalogLookup.slugForSku(manufacturer.id, group.parentSku),
        group.title,
        representative.mpn
      ),
      status: ProductStatus.PUBLISHED,
      description:
        group.description ||
        `${group.title} — ${manufacturer.name} product.`,
      discountable: !quoteOnly,
      options,
      sales_channels: [{ id: salesChannelId }],
      ...(categoryId ? { category_ids: [categoryId] } : {}),
      ...(collectionId ? { collection_id: collectionId } : {}),
      metadata: {
        manufacturer: manufacturer.name,
        manufacturer_id: manufacturer.id,
        brand: manufacturer.name,
        mpn: representative.mpn ?? group.parentSku,
        source_currency: sourceCurrency,
        source_price: quoteOnly ? null : minSourcePrice,
        fx_rate: quoteOnly ? null : minPrices.fx_rate,
        category_hint: group.category ?? null,
        category_handle: categoryMap.handle,
        import_job_id: jobId,
        variant_count: group.items.length,
        quote_only: quoteOnly,
        hide_price: quoteOnly,
        pricing_mode: quoteOnly ? "quote" : "priced",
        ...(datasheetUrl ? { datasheet_url: String(datasheetUrl) } : {}),
        ...(sourceUrl ? { source_url: String(sourceUrl) } : {}),
      },
      variants: group.items.map((item) => {
        const prices = convertWithBundle(item.source_price, sourceCurrency, fx, {
          eur_price: item.eur_price,
          gbp_price: item.gbp_price,
          usd_price: item.usd_price,
        })
        return {
          title: variantTitle(item, optionTitles, isDefault),
          sku: variantSku(manufacturer, item.sku),
          manage_inventory: false,
          allow_backorder: true,
          options: variantOptionMap(item, optionTitles, isDefault),
          prices: quoteOnly
            ? []
            : [
                {
                  amount: toPriceAmount(prices.gbp_price),
                  currency_code: "gbp",
                },
                {
                  amount: toPriceAmount(prices.eur_price),
                  currency_code: "eur",
                },
                {
                  amount: toPriceAmount(prices.usd_price),
                  currency_code: "usd",
                },
              ],
          metadata: {
            mpn: item.mpn ?? item.sku,
            moq: item.moq ?? 1,
            manufacturer_sku: item.sku,
            parent_sku: group.parentSku,
            quote_only: quoteOnly,
            hide_price: quoteOnly,
            connectivity: item.options?.Connectivity ?? null,
            router: item.options?.Router ?? null,
            region: item.options?.Region ?? null,
            antenna: item.options?.Antenna ?? null,
          },
        }
      }),
    }
  })

  const batchSize = 5
  for (let i = 0; i < productsData.length; i += batchSize) {
    const batch = productsData.slice(i, i + batchSize)
    const batchGroups = groups.slice(i, i + batchSize)

    try {
      const { result: products } = await createProductsWorkflow(scope).run({
        input: { products: batch as never },
      })
      imported += products.length
      variantCount += batch.reduce(
        (sum, product) => sum + product.variants.length,
        0
      )
    } catch (error) {
      const batchMessage = formatImportError(error)
      logger.warn(
        `[catalog-import] ${manufacturer.name} batch failed, retrying item-by-item: ${batchMessage}`
      )

      for (let j = 0; j < batch.length; j++) {
        const group = batchGroups[j]
        try {
          const { result: products } = await createProductsWorkflow(scope).run({
            input: { products: [batch[j]] as never },
          })
          imported += products.length
          variantCount += batch[j].variants.length
        } catch (itemError) {
          const message = formatImportError(itemError)
          logger.error(
            `[catalog-import] ${manufacturer.name} item failed ${group.parentSku}: ${message}`
          )
          errors.push({ sku: group.parentSku, message })
          skipped += group.items.length
        }
      }
    }
  }

  const status = errors.length && imported === 0 ? "failed" : "completed"

  await catalog.updateImportJob(jobId, {
    status,
    imported_count: imported,
    skipped_count: skipped,
    error_count: errors.length,
    fx_rate_used: fx.sourceToGbp,
    summary: {
      imported,
      skipped,
      errors: errors.length,
      variant_count: variantCount,
      currencies: quoteOnly ? [] : ["gbp", "eur", "usd"],
      manufacturer_id: manufacturer.id,
      quote_only: quoteOnly,
    },
    error_log: errors.slice(0, 50),
  })

  return {
    job_id: jobId,
    manufacturer: manufacturer.name,
    manufacturer_id: manufacturer.id,
    status,
    imported_count: imported,
    skipped_count: skipped,
    error_count: errors.length,
    fx_rate: fx.sourceToGbp,
    fx_rate_eur_gbp: fx.sourceToGbp,
    errors: errors.slice(0, 20),
  }
}
