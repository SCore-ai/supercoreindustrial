import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Client } from "pg"

/**
 * Fix manufacturer import prices that were stored as minor units (×100).
 * Medusa v2 expects major units. Safe to re-run: aborts if already corrected.
 */
export default async function fixManufacturerPriceScale({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const databaseUrl =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@postgres:5432/medusa-store"

  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    const probe = await client.query<{ amount: string }>(
      `
      SELECT pr.amount::text AS amount
      FROM price pr
      JOIN product_variant_price_set pvps ON pvps.price_set_id = pr.price_set_id
      JOIN product_variant pv ON pv.id = pvps.variant_id
      JOIN product p ON p.id = pv.product_id
      WHERE p.deleted_at IS NULL
        AND pr.deleted_at IS NULL
        AND pv.sku = '1008111010'
        AND pr.currency_code = 'eur'
      LIMIT 1
      `
    )

    const eurAmount = Number(probe.rows[0]?.amount ?? NaN)
    logger.info(`[price-fix] probe zenitel 1008111010 EUR amount=${eurAmount}`)

    if (!Number.isFinite(eurAmount)) {
      throw new Error("Could not find probe SKU 1008111010 EUR price")
    }

    // Expected wrong: 104900; expected correct: 1049
    if (eurAmount > 5000 && eurAmount < 200000 && Math.abs(eurAmount - 104900) < 1) {
      logger.info("[price-fix] Detected ×100 bug — applying /100 correction")
    } else if (Math.abs(eurAmount - 1049) < 0.5) {
      logger.info("[price-fix] Prices already look correct — nothing to do")
      return
    } else {
      throw new Error(
        `Unexpected probe amount ${eurAmount}; refusing to auto-scale. Expected ~104900 (bug) or ~1049 (fixed).`
      )
    }

    const result = await client.query(
      `
      UPDATE price pr
      SET
        amount = pr.amount / 100,
        raw_amount = jsonb_build_object(
          'value', trim(trailing '.' from trim(trailing '0' from to_char(pr.amount / 100, 'FM9999999999999999990.9999999999'))),
          'precision', COALESCE((pr.raw_amount->>'precision')::int, 20)
        ),
        updated_at = NOW()
      FROM product_variant_price_set pvps
      JOIN product_variant pv ON pv.id = pvps.variant_id
      JOIN product p ON p.id = pv.product_id
      WHERE pr.price_set_id = pvps.price_set_id
        AND pr.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND (p.handle LIKE 'zenitel-%' OR p.handle LIKE 'axis-%')
      `
    )

    logger.info(`[price-fix] updated rows=${result.rowCount}`)

    const after = await client.query<{ amount: string; currency_code: string }>(
      `
      SELECT pr.currency_code, pr.amount::text AS amount
      FROM price pr
      JOIN product_variant_price_set pvps ON pvps.price_set_id = pr.price_set_id
      JOIN product_variant pv ON pv.id = pvps.variant_id
      WHERE pv.sku = '1008111010'
        AND pr.deleted_at IS NULL
      ORDER BY pr.currency_code
      `
    )

    for (const row of after.rows) {
      logger.info(
        `[price-fix] after 1008111010 ${row.currency_code}=${row.amount}`
      )
    }

    const axis = await client.query<{ amount: string; currency_code: string }>(
      `
      SELECT pr.currency_code, pr.amount::text AS amount
      FROM price pr
      JOIN product_variant_price_set pvps ON pvps.price_set_id = pr.price_set_id
      JOIN product_variant pv ON pv.id = pvps.variant_id
      JOIN product p ON p.id = pv.product_id
      WHERE p.handle = 'axis-01001-001'
        AND pr.deleted_at IS NULL
      ORDER BY pr.currency_code
      LIMIT 6
      `
    )

    for (const row of axis.rows) {
      logger.info(
        `[price-fix] after axis-01001-001 ${row.currency_code}=${row.amount}`
      )
    }
  } finally {
    await client.end()
  }
}
