import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
  PriceListStatus,
  PriceListType,
} from "@medusajs/framework/utils"
import {
  createCustomerGroupsWorkflow,
  createInventoryLevelsWorkflow,
  createPriceListsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ensureProductsCollection,
  getTypesenseClient,
  PRODUCTS_COLLECTION,
} from "../lib/typesense-client"
import {
  buildEds305Product,
  EDS305_HANDLE,
} from "../lib/seed/eds-305-product"

// One-off backfill for a database that was already seeded by
// initial-data-seed.ts before MPNs / the quote-gated demo product existed.
// Safe to run once; skips work that's already done.
export default async function backfillSupercoreExtras({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT)

  logger.info("Backfilling MPNs onto existing variants...")

  const mpnBySku: Record<string, string> = {
    "SC-CCTV-DOME-SA": "MX-D26B-6D061",
    "SC-CCTV-DOME-Z2": "MX-D26B-6D061-EX2",
    "SC-PAGA-EXIGO-SA": "1002000090",
    "SC-PAGA-EXIGO-Z1": "1002000090-EX1",
    "SC-CABLE-NEK606-M": "AMERCABLE-GEXOL-P-NEK606",
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "metadata"],
  })

  for (const variant of variants) {
    const mpn = mpnBySku[variant.sku as string]
    if (!mpn) continue
    if ((variant.metadata as any)?.mpn) continue

    await productModuleService.updateProductVariants(variant.id, {
      metadata: { ...(variant.metadata as object), mpn },
    })
    logger.info(`  set mpn=${mpn} on ${variant.sku}`)
  }

  logger.info("Checking for Trade Account customer group...")

  const { data: existingGroups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name"],
    filters: { name: "Trade Account" } as any,
  })

  let tradeGroupId = existingGroups[0]?.id

  if (!tradeGroupId) {
    const { result: tradeGroups } = await createCustomerGroupsWorkflow(
      container
    ).run({
      input: { customersData: [{ name: "Trade Account" }] },
    })
    tradeGroupId = tradeGroups[0].id
    logger.info(`  created Trade Account group ${tradeGroupId}`)
  } else {
    logger.info(`  Trade Account group already exists (${tradeGroupId})`)
  }

  logger.info("Checking for quote-gated demo product...")

  const { data: existingEx } = await query.graph({
    entity: "product",
    fields: ["id", "variants.id"],
    filters: { handle: "zone-1-ptz-camera-station" } as any,
  })

  let exVariantId = existingEx[0]?.variants?.[0]?.id

  if (!exVariantId) {
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["id", "handle"],
      filters: { handle: "explosion-protected-devices" } as any,
    })
    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id"],
    })
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
    })

    const { result: exProducts } = await createProductsWorkflow(
      container
    ).run({
      input: {
        products: [
          {
            title: "Zone 1 PTZ Camera Station",
            handle: "zone-1-ptz-camera-station",
            description:
              "Sample explosion-protected PTZ camera station, Zone 1 / Division 1 certified. Quote-gated: pricing resolves via Trade Account price list only. Replace with real manufacturer datasheets.",
            category_ids: [categories[0].id],
            status: ProductStatus.PUBLISHED,
            options: [{ title: "Certification", values: ["Zone 1 / Division 1"] }],
            variants: [
              {
                title: "Zone 1 / Division 1",
                sku: "SC-EX-PTZ-Z1",
                options: { Certification: "Zone 1 / Division 1" },
                metadata: { mpn: "EXPTZ-Z1D1-316L" },
                prices: [],
              },
            ],
            sales_channels: [{ id: salesChannels[0].id }],
          },
        ],
      },
    })

    exVariantId = exProducts[0].variants![0].id
    logger.info(`  created quote-gated product, variant ${exVariantId}`)

    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
      filters: { sku: "SC-EX-PTZ-Z1" } as any,
    })

    if (inventoryItems[0]) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: [
            {
              location_id: stockLocations[0].id,
              stocked_quantity: 1000000,
              inventory_item_id: inventoryItems[0].id,
            },
          ],
        },
      })
      logger.info("  set inventory level for quote-gated product")
    }
  } else {
    logger.info(`  quote-gated product already exists (variant ${exVariantId})`)
  }

  logger.info("Checking for Trade Account price list...")

  const { data: existingPriceLists } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
    filters: { title: "Trade Account Pricing" } as any,
  })

  if (!existingPriceLists[0]) {
    await createPriceListsWorkflow(container).run({
      input: {
        price_lists_data: [
          {
            title: "Trade Account Pricing",
            name: "Trade Account Pricing",
            description:
              "Override pricing visible to Trade Account customers only.",
            status: PriceListStatus.ACTIVE,
            type: PriceListType.OVERRIDE,
            rules: { customer_group_id: [tradeGroupId] },
            prices: [
              { variant_id: exVariantId, amount: 425000, currency_code: "gbp" },
              { variant_id: exVariantId, amount: 495000, currency_code: "eur" },
              { variant_id: exVariantId, amount: 535000, currency_code: "usd" },
            ],
          },
        ],
      },
    })
    logger.info("  created Trade Account Pricing price list")
  } else {
    logger.info("  Trade Account Pricing price list already exists")
  }

  logger.info("Checking for EDS-305 matrix demo product...")

  const { data: existingEds305 } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle: EDS305_HANDLE } as any,
  })

  if (!existingEds305[0]) {
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["id", "handle"],
      filters: { handle: "cctv-explosion-protected" } as any,
    })
    const { data: salesChannels } = await query.graph({
      entity: "sales_channel",
      fields: ["id"],
    })
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id"],
    })

    const categoryId = categories[0]?.id
    if (!categoryId) {
      logger.warn(
        "  cctv-explosion-protected category not found; skipping EDS-305 seed"
      )
    } else {
      const eds305 = buildEds305Product({
        categoryId,
        salesChannelId: salesChannels[0].id,
      })

      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              ...eds305,
              status: ProductStatus.PUBLISHED,
            },
          ],
        },
      })

      logger.info("  created EDS-305 matrix demo product")

      const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
        filters: { sku: { $like: "SC-EDS305-%" } } as any,
      })

      if (inventoryItems.length && stockLocations[0]) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: inventoryItems.map((item) => ({
              location_id: stockLocations[0].id,
              stocked_quantity: 1000000,
              inventory_item_id: item.id,
            })),
          },
        })
        logger.info(`  set inventory for ${inventoryItems.length} EDS-305 SKUs`)
      }
    }
  } else {
    logger.info("  EDS-305 matrix demo product already exists")
  }

  logger.info("Reindexing all products into Typesense...")

  await ensureProductsCollection()
  const client = getTypesenseClient()

  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "status",
      "categories.name",
      "variants.sku",
      "variants.metadata",
      "variants.prices.amount",
      "variants.options.value",
      "variants.options.option.title",
    ],
  })

  for (const product of allProducts) {
    const variants = (product.variants as any[]) || []

    const sku = variants.map((v) => v.sku).filter(Boolean)
    const mpn = variants
      .map((v) => v.metadata?.mpn)
      .filter((v): v is string => typeof v === "string" && v.length > 0)
    const certification = Array.from(
      new Set(
        variants
          .flatMap((v) => v.options || [])
          .filter((o: any) => o?.option?.title === "Certification")
          .map((o: any) => o.value)
          .filter(Boolean)
      )
    )
    const hasPrice = variants.some((v) => (v.prices?.length ?? 0) > 0)

    await client
      .collections(PRODUCTS_COLLECTION)
      .documents()
      .upsert({
        id: product.id,
        title: product.title || "",
        handle: product.handle || "",
        thumbnail: product.thumbnail || "",
        sku,
        mpn,
        category: (product.categories || []).map((c: any) => c.name),
        certification,
        has_price: hasPrice,
        status: product.status || "draft",
      } as any)
  }

  logger.info(`Reindexed ${allProducts.length} products into Typesense.`)

  logger.info("Backfill complete.")
}
