import { OFFER_PDF_BRAND } from "./brand"
import type { OfferPdfDocument } from "./document"

export type OfferSellerSettings = {
  company_legal_name?: string | null
  company_address?: string | null
  company_phone?: string | null
  company_email?: string | null
  company_vat_number?: string | null
  company_registration_number?: string | null
  company_iban?: string | null
  company_bank?: string | null
  company_bic?: string | null
  company_payment_term?: string | null
}

function pick(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function addressLinesFromText(value?: string | null) {
  const lines = (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.length ? lines : [...OFFER_PDF_BRAND.addressLines]
}

export function resolveOfferSeller(settings?: OfferSellerSettings | null): {
  seller: OfferPdfDocument["seller"]
  payment_term: string
} {
  const addressLines = addressLinesFromText(settings?.company_address)
  const country =
    addressLines.find((line) => /united kingdom|uk\b/i.test(line)) ||
    OFFER_PDF_BRAND.country

  return {
    payment_term: pick(settings?.company_payment_term, OFFER_PDF_BRAND.paymentTerm),
    seller: {
      legalName: pick(settings?.company_legal_name, OFFER_PDF_BRAND.legalName),
      tradingName: OFFER_PDF_BRAND.tradingName,
      email: pick(settings?.company_email, OFFER_PDF_BRAND.email),
      website: OFFER_PDF_BRAND.website,
      phone: pick(settings?.company_phone, OFFER_PDF_BRAND.phone),
      country,
      addressLines,
      vatNumber: pick(settings?.company_vat_number, OFFER_PDF_BRAND.vatNumber),
      companyNumber: pick(
        settings?.company_registration_number,
        OFFER_PDF_BRAND.companyNumber
      ),
      iban: settings?.company_iban?.trim() || OFFER_PDF_BRAND.iban,
      bank: settings?.company_bank?.trim() || OFFER_PDF_BRAND.bank,
      bic: settings?.company_bic?.trim() || OFFER_PDF_BRAND.bic,
    },
  }
}
