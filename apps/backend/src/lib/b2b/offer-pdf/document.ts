import {
  calculateLineTotal,
  calculateLineUnitPrice,
  calculateQuoteOfferTotal,
} from "../quote-pricing"
import type { QuoteAdminStatus } from "../quote-integration"
import { OFFER_PDF_BRAND } from "./brand"

export type OfferPdfLine = {
  title: string
  sku: string | null
  mpn: string | null
  quantity: number
  unit_price: number
  discount_percent: number
  net_unit_price: number
  line_total: number
  details: string[]
}

export type OfferPdfParty = {
  name: string
  contact_name: string | null
  lines: string[]
}

export type OfferPdfDocument = {
  quote_id: string
  offer_number: string
  filename: string
  issued_at: Date
  valid_until: Date | null
  currency_code: string
  project: string | null
  customer_notes: string | null
  customer_id: string | null
  payment_term: string
  shipping_cost: number
  vat_amount: number
  vat_label: string
  customer: {
    name: string
    contact_name: string | null
    legal_name: string | null
    email: string | null
    vat_number: string | null
    phone: string | null
    country: string | null
  }
  seller: {
    legalName: string
    tradingName: string
    email: string
    website: string
    phone: string
    country: string
    addressLines: string[]
    vatNumber: string
    companyNumber: string
    iban: string
    bank: string
    bic: string
  }
  invoice_address: OfferPdfParty
  shipping_address: OfferPdfParty
  lines: OfferPdfLine[]
  subtotal: number
  discount_total: number
  total: number
}

const PRICED_STATUSES: QuoteAdminStatus[] = ["quoted", "won"]

function pad2(value: number) {
  return String(value).padStart(2, "0")
}

export function offerNumberFromQuoteId(quoteId: string) {
  return `SCI-${quoteId.slice(-8).toUpperCase()}`
}

export function offerPdfFilename(quoteId: string, issuedAt = new Date()) {
  const number = offerNumberFromQuoteId(quoteId)
  const date = `${pad2(issuedAt.getDate())}-${pad2(issuedAt.getMonth() + 1)}-${issuedAt.getFullYear()}`
  const time = `${pad2(issuedAt.getHours())}-${pad2(issuedAt.getMinutes())}-${pad2(issuedAt.getSeconds())}`
  return `${OFFER_PDF_BRAND.tradingName}_Quote_${number}_${date}_${time}.pdf`
}

export function isPricedOfferStatus(status?: QuoteAdminStatus | null) {
  return Boolean(status && PRICED_STATUSES.includes(status))
}

export function formatAddressLines(input?: {
  company?: string | null
  first_name?: string | null
  last_name?: string | null
  address_1?: string | null
  address_2?: string | null
  city?: string | null
  postal_code?: string | null
  province?: string | null
  country_code?: string | null
  country?: string | null
} | null): string[] {
  if (!input) {
    return []
  }

  const street = [input.address_1, input.address_2].filter(Boolean).join(", ")
  const contact = [input.first_name, input.last_name].filter(Boolean).join(" ")
  const country = input.country || (input.country_code ? input.country_code.toUpperCase() : "")

  return [
    input.company,
    contact,
    street,
    input.city,
    input.postal_code,
    input.province,
    country,
  ]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
}

const COUNTRY_NAMES: Record<string, string> = {
  at: "Austria",
  be: "Belgium",
  cn: "China",
  cz: "Czech Republic",
  de: "Germany",
  dk: "Denmark",
  es: "Spain",
  fi: "Finland",
  fr: "France",
  gb: "United Kingdom",
  ie: "Ireland",
  it: "Italy",
  jp: "Japan",
  kr: "South Korea",
  nl: "Netherlands",
  no: "Norway",
  pl: "Poland",
  se: "Sweden",
  tw: "Taiwan",
  us: "United States",
}

function countryName(value?: string | null) {
  const raw = value?.trim()
  if (!raw) {
    return null
  }
  if (raw.length > 3) {
    return raw
  }
  return COUNTRY_NAMES[raw.toLowerCase()] ?? raw.toUpperCase()
}

function toMm(value: number) {
  return value > 0 && value < 20 ? Math.round(value * 1000) : value
}

function mmToIn(mm: number) {
  return (mm / 25.4).toFixed(2)
}

function gToLbs(grams: number) {
  return (grams / 453.59237).toFixed(1)
}

export function formatProductDetails(input: {
  hs_code?: string | null
  origin_country?: string | null
  length?: number | null
  width?: number | null
  height?: number | null
  weight?: number | null
  stock_status?: "in_stock" | "out_of_stock" | "check" | null
}): string[] {
  const hs = input.hs_code?.trim() || "—"
  const origin = countryName(input.origin_country) || "—"
  const length = typeof input.length === "number" ? toMm(input.length) : null
  const width = typeof input.width === "number" ? toMm(input.width) : null
  const height = typeof input.height === "number" ? toMm(input.height) : null
  const weight =
    typeof input.weight === "number" && input.weight > 0 ? input.weight : null
  const hasDims =
    typeof length === "number" &&
    length > 0 &&
    typeof width === "number" &&
    width > 0 &&
    typeof height === "number" &&
    height > 0

  const dimText = hasDims
    ? `${length}x${width}x${height}mm (${mmToIn(length)}x${mmToIn(width)}x${mmToIn(height)}in.)`
    : "—"
  const weightText = weight ? `${weight}gr. (${gToLbs(weight)}lbs)` : "—"
  const stock =
    input.stock_status === "out_of_stock"
      ? "Out of stock"
      : input.stock_status === "check"
        ? "Check availability"
        : "In stock"

  return [
    `HS Code: ${hs}, Country of origin: ${origin}`,
    `Dimensions (LWH): ${dimText}, Weight: ${weightText}`,
    stock,
  ]
}

export function assertPricedOfferLines(
  items: Array<{
    quantity: number
    unit_price?: number | null
    discount_percent?: number | null
    title?: string | null
    sku?: string | null
    mpn?: string | null
    details?: string[] | null
    variant?: {
      sku?: string | null
      title?: string | null
      product?: { title?: string | null } | null
    } | null
  }>
): OfferPdfLine[] {
  if (!items.length) {
    throw new Error("This quote has no line items.")
  }

  return items.map((item, index) => {
    const unitPrice = calculateLineUnitPrice(item)
    const lineTotal = calculateLineTotal(item)

    if (item.unit_price == null || unitPrice == null || lineTotal == null) {
      throw new Error(
        `Line ${index + 1} is not priced. Send a priced offer before exporting the PDF.`
      )
    }

    const title =
      item.title ??
      item.variant?.product?.title ??
      item.variant?.title ??
      `Item ${index + 1}`

    return {
      title,
      sku: item.sku ?? item.variant?.sku ?? null,
      mpn: item.mpn ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent ?? 0,
      net_unit_price: unitPrice,
      line_total: lineTotal,
      details: item.details?.length
        ? item.details.filter(Boolean)
        : formatProductDetails({}),
    }
  })
}

function partyFromLines(
  name: string,
  contactName: string | null,
  lines: string[]
): OfferPdfParty {
  const unique = [...new Set(lines.filter(Boolean))]
  return {
    name,
    contact_name: contactName,
    lines: unique.length ? unique : [name],
  }
}

export function buildOfferPdfDocument(input: {
  quote_id: string
  customer_id?: string | null
  currency_code?: string | null
  valid_until?: Date | string | null
  created_at?: Date | string | null
  issued_at?: Date | string | null
  project?: string | null
  notes?: string | null
  email?: string | null
  company_name?: string | null
  contact_name?: string | null
  shipping_cost?: number | null
  invoice_address?: string[] | null
  shipping_address?: string[] | null
  seller?: OfferPdfDocument["seller"]
  payment_term?: string | null
  company?: {
    id?: string | null
    name?: string | null
    legal_name?: string | null
    email?: string | null
    vat_number?: string | null
    phone?: string | null
    country_code?: string | null
    registration_number?: string | null
  } | null
  items: Array<{
    quantity: number
    unit_price?: number | null
    discount_percent?: number | null
    title?: string | null
    sku?: string | null
    mpn?: string | null
    details?: string[] | null
    variant?: {
      sku?: string | null
      title?: string | null
      product?: { title?: string | null } | null
    } | null
  }>
}): OfferPdfDocument {
  const lines = assertPricedOfferLines(input.items)
  const goodsTotal = calculateQuoteOfferTotal(input.items)

  if (goodsTotal == null) {
    throw new Error("Offer total could not be calculated.")
  }

  const listSubtotal = lines.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0
  )
  const discountTotal = Math.round((listSubtotal - goodsTotal) * 100) / 100
  const shippingCost = Number(input.shipping_cost ?? 0)
  const vatAmount = 0
  const total = Math.round((goodsTotal + shippingCost + vatAmount) * 100) / 100
  const company = input.company
  const issuedAt = input.issued_at
    ? new Date(input.issued_at)
    : input.created_at
      ? new Date(input.created_at)
      : new Date()
  const customerName =
    company?.legal_name?.trim() ||
    company?.name?.trim() ||
    input.company_name?.trim() ||
    "Valued customer"
  const contactName = input.contact_name?.trim() || null
  const fallbackLines = [
    customerName,
    contactName,
    company?.email ?? input.email,
    company?.phone,
    company?.vat_number ? `VAT ${company.vat_number}` : "",
    company?.country_code ? company.country_code.toUpperCase() : "",
  ].filter((line): line is string => Boolean(line))
  const invoiceLines = input.invoice_address?.length
    ? input.invoice_address
    : fallbackLines
  const shippingLines = input.shipping_address?.length
    ? input.shipping_address
    : invoiceLines

  return {
    quote_id: input.quote_id,
    offer_number: offerNumberFromQuoteId(input.quote_id),
    filename: offerPdfFilename(input.quote_id, issuedAt),
    issued_at: issuedAt,
    valid_until: input.valid_until ? new Date(input.valid_until) : null,
    currency_code: (input.currency_code ?? "gbp").toLowerCase(),
    project: input.project ?? null,
    customer_notes: input.notes ?? null,
    customer_id: input.customer_id ?? company?.id ?? null,
    payment_term: input.payment_term?.trim() || OFFER_PDF_BRAND.paymentTerm,
    shipping_cost: shippingCost,
    vat_amount: vatAmount,
    vat_label: "VAT 0",
    customer: {
      name: customerName,
      contact_name: contactName,
      legal_name: company?.legal_name ?? null,
      email: company?.email ?? input.email ?? null,
      vat_number: company?.vat_number ?? null,
      phone: company?.phone ?? null,
      country: company?.country_code
        ? company.country_code.toUpperCase()
        : null,
    },
    seller: input.seller ?? {
      legalName: OFFER_PDF_BRAND.legalName,
      tradingName: OFFER_PDF_BRAND.tradingName,
      email: OFFER_PDF_BRAND.email,
      website: OFFER_PDF_BRAND.website,
      phone: OFFER_PDF_BRAND.phone,
      country: OFFER_PDF_BRAND.country,
      addressLines: [...OFFER_PDF_BRAND.addressLines],
      vatNumber: OFFER_PDF_BRAND.vatNumber,
      companyNumber: OFFER_PDF_BRAND.companyNumber,
      iban: OFFER_PDF_BRAND.iban,
      bank: OFFER_PDF_BRAND.bank,
      bic: OFFER_PDF_BRAND.bic,
    },
    invoice_address: partyFromLines(customerName, contactName, invoiceLines),
    shipping_address: partyFromLines(customerName, contactName, shippingLines),
    lines,
    subtotal: Math.round(goodsTotal * 100) / 100,
    discount_total: discountTotal,
    total,
  }
}
