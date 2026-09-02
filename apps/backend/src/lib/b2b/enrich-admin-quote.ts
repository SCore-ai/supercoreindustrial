import { MedusaContainer } from "@medusajs/framework/types"
import { calculateQuoteOfferTotal } from "./quote-pricing"
import { parseQuoteMetadata } from "./quote-integration"
import { enrichQuoteLineItems } from "./enrich-quote-items"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"

type QuoteWithItems = {
  id: string
  metadata?: Record<string, unknown> | null
  company_id?: string | null
  items: Array<Record<string, unknown>>
  [key: string]: unknown
}

export async function enrichAdminQuoteResponse(
  scope: MedusaContainer,
  quote: QuoteWithItems
) {
  const items = await enrichQuoteLineItems(
    scope,
    quote.items as never
  )

  let company = null

  if (quote.company_id) {
    try {
      const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
      company = await b2bService.retrieveCompanyWithMembers(quote.company_id)
    } catch {
      company = null
    }
  }

  return {
    ...quote,
    items,
    company,
    offer_total: calculateQuoteOfferTotal(items as never),
    b2b: parseQuoteMetadata(quote.metadata as Record<string, unknown>),
  }
}
