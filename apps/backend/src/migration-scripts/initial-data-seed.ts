import { MedusaContainer } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  SUPERCORE_CATEGORY_TREE,
} from "../lib/seed/supercore-category-tree";
import { syncSupercoreCategoryTree } from "./sync-category-tree";
import { buildEds305Product } from "../lib/seed/eds-305-product";
import {
  ALL_MULTI_REGION_COUNTRIES,
  MULTI_REGION_DEFINITIONS,
  regionShippingPrices,
} from "../lib/multi-region-config";

export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  );

  const countries = ALL_MULTI_REGION_COUNTRIES;

  logger.info("Seeding store data...");
  const {
    result: [defaultSalesChannel],
  } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        {
          name: "Default Sales Channel",
          description: "Created by Medusa",
        },
      ],
    },
  });

  const {
    result: [publishableApiKey],
  } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Default Publishable API Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  });

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel.id],
    },
  });

  await createStoresWorkflow(container).run({
    input: {
      stores: [
        {
          name: "Supercore Industrial",
          supported_currencies: [
            {
              currency_code: "gbp",
              is_default: true,
            },
            {
              currency_code: "eur",
              is_default: false,
            },
            {
              currency_code: "usd",
              is_default: false,
            },
          ],
          default_sales_channel_id: defaultSalesChannel.id,
        },
      ],
    },
  });

  logger.info("Seeding multi-region pricing (GBP / EUR / USD)...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: MULTI_REGION_DEFINITIONS.map((definition) => ({
        name: definition.name,
        currency_code: definition.currency_code,
        countries: definition.countries,
        payment_providers: ["pp_system_default"],
      })),
    },
  });

  const regionIds = Object.fromEntries(
    regionResult.map((region) => [region.currency_code, region.id])
  ) as Record<"gbp" | "eur" | "usd", string>;

  logger.info(
    `Finished seeding ${regionResult.length} regions (GBP, EUR, USD).`
  );

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "UK Warehouse",
          address: {
            city: "Aberdeen",
            country_code: "GB",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "UK Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Supercore shipping zones",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: regionShippingPrices(regionIds, {
          gbp: 15,
          eur: 18,
          usd: 20,
        }),
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: regionShippingPrices(regionIds, {
          gbp: 35,
          eur: 40,
          usd: 45,
        }),
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel.id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding Supercore product categories...");

  const handleMap = await syncSupercoreCategoryTree(container, SUPERCORE_CATEGORY_TREE);
  const byHandle = Object.fromEntries(
    [...handleMap.entries()].map(([handle, id]) => [handle, { id, handle }])
  );

  logger.info("Seeding sample industrial products...");

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Industrial Dome Camera",
          handle: "industrial-dome-camera",
          description:
            "Rugged IP dome camera for industrial CCTV deployments. Sample SKU for Supercore catalog bootstrap.",
          category_ids: [byHandle["cctv-systems"].id],
          status: ProductStatus.PUBLISHED,
          options: [
            {
              title: "Certification",
              values: ["Safe Area", "Zone 2"],
            },
          ],
          variants: [
            {
              title: "Safe Area",
              sku: "SC-CCTV-DOME-SA",
              options: { Certification: "Safe Area" },
              prices: [
                { amount: 45000, currency_code: "gbp" },
                { amount: 52000, currency_code: "eur" },
                { amount: 56000, currency_code: "usd" },
              ],
            },
            {
              title: "Zone 2",
              sku: "SC-CCTV-DOME-Z2",
              options: { Certification: "Zone 2" },
              prices: [
                { amount: 89000, currency_code: "gbp" },
                { amount: 99000, currency_code: "eur" },
                { amount: 109000, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "EXIGO Network Amplifier Module",
          handle: "exigo-network-amplifier",
          description:
            "Sample PAGA/network audio amplifier module for industrial PA/GA systems.",
          category_ids: [byHandle["paga-systems"].id],
          status: ProductStatus.PUBLISHED,
          options: [
            {
              title: "Certification",
              values: ["Safe Area", "Zone 1"],
            },
          ],
          variants: [
            {
              title: "Safe Area",
              sku: "SC-PAGA-EXIGO-SA",
              options: { Certification: "Safe Area" },
              metadata: { mpn: "1002000090" },
              prices: [
                { amount: 125000, currency_code: "gbp" },
                { amount: 145000, currency_code: "eur" },
                { amount: 155000, currency_code: "usd" },
              ],
            },
            {
              title: "Zone 1",
              sku: "SC-PAGA-EXIGO-Z1",
              options: { Certification: "Zone 1" },
              metadata: { mpn: "1002000090-EX1" },
              prices: [
                { amount: 210000, currency_code: "gbp" },
                { amount: 240000, currency_code: "eur" },
                { amount: 255000, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
        {
          title: "NEK 606 Marine Instrumentation Cable",
          handle: "nek-606-marine-cable",
          description:
            "Sample marine instrumentation cable (NEK 606 class). Replace with real manufacturer datasheets.",
          category_ids: [byHandle["cables"].id],
          status: ProductStatus.PUBLISHED,
          options: [
            {
              title: "Certification",
              values: ["Safe Area"],
            },
          ],
          variants: [
            {
              title: "Safe Area / per metre",
              sku: "SC-CABLE-NEK606-M",
              options: { Certification: "Safe Area" },
              metadata: { mpn: "AMERCABLE-GEXOL-P-NEK606" },
              prices: [
                { amount: 850, currency_code: "gbp" },
                { amount: 990, currency_code: "eur" },
                { amount: 1100, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  // Quote-gated sample: Explosion-Protected Devices carries no public base
  // price. Anonymous/public storefront visitors see no calculated_price and
  // the storefront falls back to a "Request Quote" CTA. A logged-in customer
  // in the "Trade Account" customer group resolves the override price from
  // the price list created below. This is a data-entry convention, not an
  // enforced rule — any product left without a base `prices` array behaves
  // the same way.
  logger.info("Seeding quote-gated sample product...");

  const { result: tradeGroups } = await createCustomerGroupsWorkflow(
    container
  ).run({
    input: {
      customersData: [{ name: "Trade Account" }],
    },
  });
  const tradeGroup = tradeGroups[0];

  const { result: exProducts } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Zone 1 PTZ Camera Station",
          handle: "zone-1-ptz-camera-station",
          description:
            "Sample explosion-protected PTZ camera station, Zone 1 / Division 1 certified. Quote-gated: pricing resolves via Trade Account price list only. Replace with real manufacturer datasheets.",
          category_ids: [byHandle["explosion-protected-devices"].id],
          status: ProductStatus.PUBLISHED,
          options: [
            {
              title: "Certification",
              values: ["Zone 1 / Division 1"],
            },
          ],
          variants: [
            {
              title: "Zone 1 / Division 1",
              sku: "SC-EX-PTZ-Z1",
              options: { Certification: "Zone 1 / Division 1" },
              metadata: { mpn: "EXPTZ-Z1D1-316L" },
              prices: [],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel.id }],
        },
      ],
    },
  });
  const exVariant = exProducts[0].variants![0];

  await createPriceListsWorkflow(container).run({
    input: {
      price_lists_data: [
        {
          title: "Trade Account Pricing",
          name: "Trade Account Pricing",
          description: "Override pricing visible to Trade Account customers only.",
          status: PriceListStatus.ACTIVE,
          type: PriceListType.OVERRIDE,
          rules: { "customer_group_id": [tradeGroup.id] },
          prices: [
            { variant_id: exVariant.id, amount: 425000, currency_code: "gbp" },
            { variant_id: exVariant.id, amount: 495000, currency_code: "eur" },
            { variant_id: exVariant.id, amount: 535000, currency_code: "usd" },
          ],
        },
      ],
    },
  });

  logger.info("Finished seeding quote-gated sample product.");

  logger.info("Seeding EDS-305 matrix demo product...");

  const eds305 = buildEds305Product({
    categoryId: byHandle["cctv-explosion-protected"].id,
    salesChannelId: defaultSalesChannel.id,
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

  logger.info("Finished seeding EDS-305 matrix demo product.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item) => ({
        location_id: stockLocation.id,
        stocked_quantity: 1000000,
        inventory_item_id: item.id,
      })),
    },
  });

  logger.info("Finished seeding inventory levels data.");
  logger.info(
    `Publishable API key id: ${publishableApiKey.id}. Copy the token from Admin → Settings → API Key Management into apps/storefront/.env`
  );
}
