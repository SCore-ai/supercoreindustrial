/**
 * Zenitel-specific wrappers kept for existing scripts/routes.
 * Prefer manufacturer-import.ts for new brands.
 */
import { MedusaContainer } from "@medusajs/framework/types"
import {
  previewManufacturerCsv,
  runManufacturerImport,
  type ManufacturerImportResult,
  type ManufacturerPreviewResult,
} from "./manufacturer-import"

export type {
  ManufacturerPreviewRow as ZenitelPreviewRow,
  ManufacturerPreviewResult as ZenitelPreviewResult,
  ManufacturerImportResult as ZenitelImportResult,
} from "./manufacturer-import"

export async function previewZenitelCsv(
  scope: MedusaContainer,
  input: {
    csv: string
    filename?: string
    source_currency?: string
    limit?: number
  }
): Promise<ManufacturerPreviewResult> {
  return previewManufacturerCsv(scope, {
    manufacturer: "zenitel",
    ...input,
  })
}

export async function runZenitelImport(
  scope: MedusaContainer,
  input: {
    csv: string
    filename?: string
    source_currency?: string
    job_id?: string
  }
): Promise<ManufacturerImportResult> {
  return runManufacturerImport(scope, {
    manufacturer: "zenitel",
    ...input,
  })
}
