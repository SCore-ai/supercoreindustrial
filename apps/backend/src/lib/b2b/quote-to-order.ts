import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createOrderWorkflow } from "@medusajs/medusa/core-flows"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"
import { enrichQuoteLineItems } from "./enrich-quote-items"
import {
  resolveDefaultSalesChannelId,
  resolveFallbackRegionId,
  resolveRegionDetails,
} from "./medusa-integrations"
import { parseQuoteMetadata } from "./quote-integration"
import { calculateLineUnitPrice } from "./quote-pricing"

type QuoteRecord = Awaited<
  ReturnType<QuoteModuleService["retrieveWithItems"]>
>

type ShippingAddressInput = {
  first_name: string
  last_name: string
  address_1: string
  city: string
  country_code: string
  postal_code: string
  company?: string | null
  phone?: string | null
}

export type ConvertQuoteToOrderResult = {
  order_id: string
  quote: QuoteRecord
}

export async function convertQuoteToOrder(
  scope: MedusaContainer,
  quoteId: string,
  options?: { admin_notes?: string | null }
): Promise<ConvertQuoteToOrderResult> {
  const quoteService: QuoteModuleService = scope.resolve(QUOTE_MODULE)
  const quote = await quoteService.retrieveWithItems(quoteId)
  const b2b = parseQuoteMetadata(quote.metadata as Record<string, unknown>)

  if (b2b.order_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Quote is already linked to order ${b2b.order_id}`
    )
  }

  if (!quote.items?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Quote has no line items to convert"
    )
  }

  const regionId = quote.region_id ?? (await resolveFallbackRegionId(scope))

  if (!regionId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Quote is missing region_id and no default region is configured"
    )
  }

  const salesChannelId = await resolveDefaultSalesChannelId(scope)

  if (!salesChannelId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No default sales channel is configured"
    )
  }

  const region = await resolveRegionDetails(scope, regionId)

  if (!region) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Region ${regionId} was not found`
    )
  }

  const enrichedItems = await enrichQuoteLineItems(scope, quote.items)
  const orderItems: Array<{
    variant_id: string
    quantity: number
    title: string
    unit_price: number
  }> = []

  for (const item of quote.items) {
    const unitPrice = calculateLineUnitPrice(item)

    if (unitPrice == null) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "All quote line items must have offer pricing before conversion. Send a priced offer first."
      )
    }

    const enriched = enrichedItems.find((entry) => entry.id === item.id)

    orderItems.push({
      variant_id: item.variant_id,
      quantity: item.quantity,
      title:
        item.title ??
        enriched?.variant?.product?.title ??
        enriched?.variant?.title ??
        "Quote item",
      unit_price: unitPrice,
    })
  }

  let company: { name?: string; country_code?: string | null } | null = null

  if (quote.company_id) {
    try {
      const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
      company = await b2bService.retrieveB2bCompany(quote.company_id)
    } catch {
      company = null
    }
  }

  const shippingAddress = await resolveQuoteShippingAddress(
    scope,
    quote,
    company,
    region
  )

  const { result: order } = await createOrderWorkflow(scope).run({
    input: {
      region_id: regionId,
      sales_channel_id: salesChannelId,
      customer_id: quote.customer_id ?? undefined,
      email: quote.email ?? undefined,
      currency_code: quote.currency_code ?? region.currency_code ?? undefined,
      items: orderItems,
      status: "pending",
      shipping_address: shippingAddress,
      metadata: {
        b2b_quote_id: quote.id,
        b2b_company_id: quote.company_id ?? null,
        b2b_converted_from_quote: true,
      },
    },
  })

  const orderId = order.id

  const updatedQuote = await quoteService.adminUpdateQuote({
    id: quoteId,
    admin_status: "won",
    order_id: orderId,
    ...(options?.admin_notes !== undefined && {
      admin_notes: options.admin_notes,
    }),
  })

  const eventBus = scope.resolve(Modules.EVENT_BUS)
  await eventBus.emit({
    name: "quote.converted",
    data: {
      id: quoteId,
      order_id: orderId,
      company_id: quote.company_id,
    },
  })

  return {
    order_id: orderId,
    quote: updatedQuote,
  }
}

async function resolveQuoteShippingAddress(
  scope: MedusaContainer,
  quote: QuoteRecord,
  company: { name?: string; country_code?: string | null } | null,
  region: {
    countries?: Array<{ iso_2?: string | null }> | null
  }
): Promise<ShippingAddressInput> {
  if (quote.customer_id) {
    const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
      graph: (args: {
        entity: string
        fields: string[]
        filters: Record<string, unknown>
      }) => Promise<{
        data: Array<{
          first_name?: string | null
          last_name?: string | null
          addresses?: Array<{
            first_name?: string | null
            last_name?: string | null
            company?: string | null
            address_1?: string | null
            city?: string | null
            country_code?: string | null
            postal_code?: string | null
            phone?: string | null
            is_default_shipping?: boolean | null
          }> | null
        }>
      }>
    }

    const { data } = await query.graph({
      entity: "customer",
      fields: [
        "first_name",
        "last_name",
        "addresses.first_name",
        "addresses.last_name",
        "addresses.company",
        "addresses.address_1",
        "addresses.city",
        "addresses.country_code",
        "addresses.postal_code",
        "addresses.phone",
        "addresses.is_default_shipping",
      ],
      filters: { id: quote.customer_id },
    })

    const customer = data[0]
    const address =
      customer?.addresses?.find((entry) => entry.is_default_shipping) ??
      customer?.addresses?.[0]

    if (address?.address_1 && address.country_code) {
      return {
        first_name: address.first_name ?? customer?.first_name ?? "Trade",
        last_name: address.last_name ?? customer?.last_name ?? "Customer",
        company: address.company ?? company?.name ?? quote.company ?? null,
        address_1: address.address_1,
        city: address.city ?? "City",
        country_code: address.country_code.toLowerCase(),
        postal_code: address.postal_code ?? "00000",
        phone: address.phone ?? null,
      }
    }
  }

  const countryCode =
    company?.country_code?.toLowerCase() ??
    region.countries?.[0]?.iso_2?.toLowerCase() ??
    "gb"

  const companyName = company?.name ?? quote.company ?? "Trade customer"

  return {
    first_name: companyName.split(" ")[0] || "Trade",
    last_name: companyName.split(" ").slice(1).join(" ") || "Customer",
    company: companyName,
    address_1: "Quote conversion — address to be confirmed",
    city: "TBC",
    country_code: countryCode,
    postal_code: "00000",
  }
}
