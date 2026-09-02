import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../modules/b2b"
import B2bModuleService from "../../../modules/b2b/service"
import { QUOTE_MODULE } from "../../../modules/quote"
import QuoteModuleService from "../../../modules/quote/service"
import {
  enrichQuoteLineItems,
  type EnrichedQuoteLineItem,
} from "../enrich-quote-items"
import { parseQuoteMetadata } from "../quote-integration"
import {
  buildOfferPdfDocument,
  formatAddressLines,
  formatProductDetails,
  isPricedOfferStatus,
  type OfferPdfDocument,
} from "./document"
import { resolveOfferSeller } from "./offer-seller"

type CustomerRecord = {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  company_name?: string | null
  addresses?: Array<{
    address_name?: string | null
    is_default_billing?: boolean | null
    is_default_shipping?: boolean | null
    company?: string | null
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    postal_code?: string | null
    province?: string | null
    country_code?: string | null
  }>
}

function pickAddress(
  addresses: CustomerRecord["addresses"],
  kind: "billing" | "shipping"
) {
  if (!addresses?.length) {
    return null
  }

  if (kind === "billing") {
    return (
      addresses.find((address) => address.is_default_billing) ??
      addresses.find((address) => address.address_name === "billing") ??
      addresses[0]
    )
  }

  return (
    addresses.find((address) => address.is_default_shipping) ??
    addresses.find((address) => address.address_name === "shipping") ??
    addresses[0]
  )
}

function metaValue(
  records: Array<Record<string, unknown> | null | undefined>,
  keys: string[]
): string | number | null {
  for (const record of records) {
    if (!record) {
      continue
    }
    for (const key of keys) {
      const value = record[key]
      if (typeof value === "string" && value.trim()) {
        return value.trim()
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        return value
      }
    }
  }
  return null
}

function asNumber(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/[^\d.-]/g, ""))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function stockStatus(variant?: EnrichedQuoteLineItem["variant"]): "in_stock" | "out_of_stock" | "check" {
  if (!variant || variant.manage_inventory === false) {
    return "in_stock"
  }

  const levels = variant.inventory_items?.flatMap((item) => item.location_levels ?? []) ?? []
  if (!levels.length) {
    return "check"
  }

  const available = levels.reduce((sum, level) => {
    return sum + (level.stocked_quantity ?? 0) - (level.reserved_quantity ?? 0)
  }, 0)

  return available > 0 ? "in_stock" : "out_of_stock"
}

function lineDetails(item: EnrichedQuoteLineItem) {
  const product = item.variant?.product
  const variant = item.variant
  const metas = [item.metadata, variant?.metadata, product?.metadata]
  const hs =
    product?.hs_code ||
    product?.mid_code ||
    metaValue(metas, ["hs_code", "hsCode", "tariff_code", "commodity_code"])
  const origin =
    product?.origin_country ||
    metaValue(metas, ["origin_country", "country_of_origin", "origin", "coo"])

  return formatProductDetails({
    hs_code: typeof hs === "string" ? hs : hs != null ? String(hs) : null,
    origin_country: typeof origin === "string" ? origin : null,
    length: variant?.length ?? product?.length ?? asNumber(metaValue(metas, ["length", "l", "dim_l"])),
    width: variant?.width ?? product?.width ?? asNumber(metaValue(metas, ["width", "w", "dim_w"])),
    height: variant?.height ?? product?.height ?? asNumber(metaValue(metas, ["height", "h", "dim_h"])),
    weight: variant?.weight ?? product?.weight ?? asNumber(metaValue(metas, ["weight", "weight_g", "gross_weight"])),
    stock_status: stockStatus(variant),
  })
}

async function loadCustomer(
  scope: MedusaContainer,
  customerId?: string | null
): Promise<CustomerRecord | null> {
  if (!customerId) {
    return null
  }

  try {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "customer",
      fields: [
        "id",
        "email",
        "first_name",
        "last_name",
        "phone",
        "company_name",
        "addresses.address_name",
        "addresses.is_default_billing",
        "addresses.is_default_shipping",
        "addresses.company",
        "addresses.first_name",
        "addresses.last_name",
        "addresses.address_1",
        "addresses.address_2",
        "addresses.city",
        "addresses.postal_code",
        "addresses.province",
        "addresses.country_code",
      ],
      filters: { id: customerId },
    })
    return ((data as CustomerRecord[])[0] ?? null)
  } catch {
    try {
      const customerModule = scope.resolve(Modules.CUSTOMER) as {
        retrieveCustomer: (id: string) => Promise<CustomerRecord>
      }
      return await customerModule.retrieveCustomer(customerId)
    } catch {
      return null
    }
  }
}

export async function loadOfferPdfDocument(
  scope: MedusaContainer,
  quoteId: string,
  options?: { requireReleasedStatus?: boolean }
): Promise<OfferPdfDocument> {
  const quoteService = scope.resolve(QUOTE_MODULE) as QuoteModuleService
  const quote = await quoteService.retrieveWithItems(quoteId)
  const b2b = parseQuoteMetadata(quote.metadata as Record<string, unknown>)

  if (options?.requireReleasedStatus && !isPricedOfferStatus(b2b.admin_status)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "The PDF is available after our sales team sends a priced offer."
    )
  }

  const items = await enrichQuoteLineItems(scope, quote.items as never)
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  let sellerProfile = resolveOfferSeller()

  try {
    sellerProfile = resolveOfferSeller(await b2bService.getSettings())
  } catch {
    sellerProfile = resolveOfferSeller()
  }

  let company: {
    id?: string | null
    name?: string | null
    legal_name?: string | null
    email?: string | null
    vat_number?: string | null
    phone?: string | null
    country_code?: string | null
    registration_number?: string | null
    metadata?: Record<string, unknown> | null
    primary_customer_id?: string | null
  } | null = null

  if (quote.company_id) {
    try {
      company = await b2bService.retrieveB2bCompany(quote.company_id)
    } catch {
      company = null
    }
  }

  const customer = await loadCustomer(
    scope,
    quote.customer_id ?? company?.primary_customer_id
  )
  const contactName =
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim() ||
    (typeof company?.metadata?.contact_name === "string"
      ? company.metadata.contact_name
      : null)
  const invoiceAddress = formatAddressLines(pickAddress(customer?.addresses, "billing"))
  const shippingAddress = formatAddressLines(
    pickAddress(customer?.addresses, "shipping")
  )

  try {
    return buildOfferPdfDocument({
      quote_id: quote.id,
      customer_id: company?.id ?? quote.customer_id ?? customer?.id ?? null,
      currency_code: quote.currency_code,
      valid_until: quote.valid_until,
      issued_at: new Date(),
      created_at: (quote as { created_at?: Date | string }).created_at,
      project: quote.project,
      notes: quote.notes,
      email: quote.email ?? customer?.email,
      company_name: quote.company ?? customer?.company_name,
      contact_name: contactName,
      invoice_address: invoiceAddress,
      shipping_address: shippingAddress,
      seller: sellerProfile.seller,
      payment_term: sellerProfile.payment_term,
      company,
      items: items.map((item) => ({
        ...item,
        details: lineDetails(item),
      })),
    })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      error instanceof Error ? error.message : "Offer PDF could not be built."
    )
  }
}

export async function generateOfferPdf(
  scope: MedusaContainer,
  quoteId: string,
  options?: { requireReleasedStatus?: boolean }
) {
  const document = await loadOfferPdfDocument(scope, quoteId, options)
  const buffer = await renderOfferPdf(document)
  return { document, buffer }
}
