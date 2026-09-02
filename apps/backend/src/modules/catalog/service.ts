import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import CatalogImportJob from "./models/catalog-import-job"
import FxRate from "./models/fx-rate"

export const SUPPORTED_CURRENCIES = ["gbp", "eur", "usd"] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export type UpsertFxRateInput = {
  from_currency: string
  to_currency: string
  rate: number
  source?: string
  notes?: string | null
  is_active?: boolean
}

export type ConvertMoneyInput = {
  amount: number
  from: string
  to: string
}

function normalizeCurrency(code: string) {
  return code.trim().toLowerCase()
}

class CatalogModuleService extends MedusaService({
  FxRate,
  CatalogImportJob,
}) {
  async listActiveRates() {
    const rates = await this.listFxRates(
      { is_active: true },
      { order: { from_currency: "ASC" }, take: 100 }
    )
    return rates
  }

  async getRate(from: string, to: string) {
    const fromCurrency = normalizeCurrency(from)
    const toCurrency = normalizeCurrency(to)

    if (fromCurrency === toCurrency) {
      return 1
    }

    const [direct] = await this.listFxRates(
      {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        is_active: true,
      },
      { take: 1 }
    )

    if (direct?.rate && direct.rate > 0) {
      return direct.rate
    }

    // Cross via GBP when possible
    if (fromCurrency !== "gbp" && toCurrency !== "gbp") {
      const toGbp = await this.getRate(fromCurrency, "gbp")
      const fromGbp = await this.getRate("gbp", toCurrency)
      return Number((toGbp * fromGbp).toFixed(8))
    }

    // Inverse of opposite pair
    const [inverse] = await this.listFxRates(
      {
        from_currency: toCurrency,
        to_currency: fromCurrency,
        is_active: true,
      },
      { take: 1 }
    )

    if (inverse?.rate && inverse.rate > 0) {
      return Number((1 / inverse.rate).toFixed(8))
    }

    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `No FX rate configured for ${fromCurrency.toUpperCase()} → ${toCurrency.toUpperCase()}`
    )
  }

  async convertMoney(input: ConvertMoneyInput) {
    const from = normalizeCurrency(input.from)
    const to = normalizeCurrency(input.to)
    const rate = await this.getRate(from, to)
    const converted = Number((input.amount * rate).toFixed(4))

    return {
      amount: input.amount,
      from,
      to,
      rate,
      converted,
    }
  }

  async upsertRate(input: UpsertFxRateInput) {
    const from_currency = normalizeCurrency(input.from_currency)
    const to_currency = normalizeCurrency(input.to_currency)

    if (from_currency === to_currency) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "from_currency and to_currency must differ"
      )
    }

    if (!(input.rate > 0)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "rate must be greater than zero"
      )
    }

    const [existing] = await this.listFxRates(
      { from_currency, to_currency },
      { take: 1 }
    )

    if (existing) {
      return this.updateFxRates({
        id: existing.id,
        rate: input.rate,
        source: input.source ?? "manual",
        notes: input.notes ?? existing.notes,
        is_active: input.is_active ?? true,
      })
    }

    const [created] = await this.createFxRates([
      {
        from_currency,
        to_currency,
        rate: input.rate,
        source: input.source ?? "manual",
        notes: input.notes ?? null,
        is_active: input.is_active ?? true,
      },
    ])

    return created
  }

  async upsertRatePair(input: {
    base: string
    quote: string
    rate: number
    source?: string
    notes?: string | null
  }) {
    const base = normalizeCurrency(input.base)
    const quote = normalizeCurrency(input.quote)

    const forward = await this.upsertRate({
      from_currency: base,
      to_currency: quote,
      rate: input.rate,
      source: input.source,
      notes: input.notes,
    })

    const inverse = await this.upsertRate({
      from_currency: quote,
      to_currency: base,
      rate: Number((1 / input.rate).toFixed(8)),
      source: input.source,
      notes: input.notes
        ? `Inverse of ${input.notes}`
        : `Inverse of ${base}/${quote}`,
    })

    return { forward, inverse }
  }

  async createImportJob(input: {
    manufacturer: string
    source_currency?: string
    target_currency?: string
    filename?: string | null
    metadata?: Record<string, unknown> | null
  }) {
    const [job] = await this.createCatalogImportJobs([
      {
        manufacturer: input.manufacturer,
        source_currency: normalizeCurrency(input.source_currency ?? "eur"),
        target_currency: normalizeCurrency(input.target_currency ?? "gbp"),
        filename: input.filename ?? null,
        status: "draft",
        metadata: input.metadata ?? null,
      },
    ])

    return job
  }

  async updateImportJob(
    id: string,
    data: Partial<{
      status: "draft" | "previewed" | "running" | "completed" | "failed"
      total_rows: number
      imported_count: number
      skipped_count: number
      error_count: number
      fx_rate_used: number | null
      summary: Record<string, unknown> | null
      error_log: unknown
      metadata: Record<string, unknown> | null
      filename: string | null
    }>
  ) {
    return this.updateCatalogImportJobs({ id, ...data })
  }

  async listImportJobs(limit = 20, offset = 0) {
    const [jobs, count] = await this.listAndCountCatalogImportJobs(
      {},
      {
        take: limit,
        skip: offset,
        order: { created_at: "DESC" },
      }
    )

    return { jobs, count, limit, offset }
  }
}

export default CatalogModuleService
