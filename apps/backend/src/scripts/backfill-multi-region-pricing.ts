import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  ALL_MULTI_REGION_COUNTRIES,
  MULTI_REGION_CURRENCY_CODES,
  MULTI_REGION_DEFINITIONS,
} from "../lib/multi-region-config"

/**
 * Split a single combined region into GBP / EUR / USD regions.
 * Safe to re-run — skips when three currency regions already exist.
 */
export default async function backfillMultiRegionPricing({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Checking multi-region pricing setup...")

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })

  const byCurrency = new Map<string, (typeof regions)[number]>()
  for (const region of regions) {
    byCurrency.set(region.currency_code as string, region)
  }

  const hasAllCurrencies = MULTI_REGION_CURRENCY_CODES.every((code) =>
    byCurrency.has(code)
  )

  if (hasAllCurrencies && regions.length >= 3) {
    logger.info(
      "Multi-region pricing already configured (GBP, EUR, USD). Nothing to do."
    )
    return
  }

  const ukDefinition = MULTI_REGION_DEFINITIONS.find(
    (definition) => definition.currency_code === "gbp"
  )!
  const existingGbp = byCurrency.get("gbp")

  if (existingGbp) {
    logger.info(`Updating UK region (${existingGbp.id}) to GB only...`)
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: existingGbp.id },
        update: {
          name: ukDefinition.name,
          countries: ukDefinition.countries,
        },
      },
    })
  } else {
    logger.warn("No GBP region found; creating all three regions from scratch.")
  }

  const missingDefinitions = MULTI_REGION_DEFINITIONS.filter(
    (definition) => !byCurrency.has(definition.currency_code)
  )

  if (missingDefinitions.length) {
    logger.info(
      `Creating ${missingDefinitions.length} missing region(s): ${missingDefinitions
        .map((definition) => definition.currency_code.toUpperCase())
        .join(", ")}`
    )

    await createRegionsWorkflow(container).run({
      input: {
        regions: missingDefinitions.map((definition) => ({
          name: definition.name,
          currency_code: definition.currency_code,
          countries: definition.countries,
          payment_providers: ["pp_system_default"],
        })),
      },
    })
  }

  const { data: taxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["country_code"],
  })

  const existingTaxCountries = new Set(
    taxRegions.map((taxRegion) => taxRegion.country_code as string)
  )

  const missingTaxCountries = ALL_MULTI_REGION_COUNTRIES.filter(
    (countryCode) => !existingTaxCountries.has(countryCode)
  )

  if (missingTaxCountries.length) {
    logger.info(
      `Creating tax regions for: ${missingTaxCountries.join(", ")}`
    )

    await createTaxRegionsWorkflow(container).run({
      input: missingTaxCountries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    })
  }

  logger.info(
    "Multi-region pricing backfill complete. Storefront prices now resolve in GBP, EUR, or USD based on country."
  )
  logger.info(
    "Run with a fresh seed for shipping region prices; existing shipping options keep currency-based amounts."
  )
}
