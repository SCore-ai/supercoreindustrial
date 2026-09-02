export type FxRate = {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  source: string
  is_active: boolean
  notes?: string | null
  updated_at?: string
}

export type FxRatesResponse = {
  base_currency: string
  supported: string[]
  rates: FxRate[]
}

export type ConvertResponse = {
  amount: number
  from: string
  to: string
  rate: number
  converted: number
}

export type ManufacturerOption = {
  id: string
  name: string
  source_currency: string
  target_currency: string
  description: string
  default_filename: string
  sample_csv: string
  fx_label: string
}

export type ManufacturerPreviewItem = {
  sku: string
  title: string
  source_price: number
  source_currency: string
  gbp_price: number
  eur_price: number
  usd_price: number
  category?: string | null
  mpn?: string | null
}

export type ManufacturerPreviewResponse = {
  job_id: string
  manufacturer: string
  manufacturer_id: string
  source_currency: string
  target_currency: string
  fx_rate: number
  fx_rate_eur_gbp: number
  total_rows: number
  preview_count: number
  skipped_count: number
  items: ManufacturerPreviewItem[]
  skipped: Array<{ reason: string; sku?: string }>
}

export type ManufacturerImportResult = {
  job_id: string
  manufacturer: string
  manufacturer_id: string
  status: string
  imported_count: number
  skipped_count: number
  error_count: number
  fx_rate: number
  fx_rate_eur_gbp: number
  errors: Array<{ sku: string; message: string }>
}

/** @deprecated alias */
export type ZenitelPreviewItem = ManufacturerPreviewItem
/** @deprecated alias */
export type ZenitelPreviewResponse = ManufacturerPreviewResponse
/** @deprecated alias */
export type ZenitelImportResult = ManufacturerImportResult

export type CatalogImportJob = {
  id: string
  manufacturer: string
  source_currency: string
  target_currency: string
  status: string
  filename?: string | null
  total_rows: number
  imported_count: number
  skipped_count: number
  error_count: number
  fx_rate_used?: number | null
  created_at?: string
}
