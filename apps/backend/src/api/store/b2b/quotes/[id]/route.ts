import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { QUOTE_MODULE } from "../../../../../modules/quote"
import QuoteModuleService from "../../../../../modules/quote/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../lib/b2b/customer-context"
import {
  customerCanAccessQuote,
  enrichStoreQuoteResponse,
} from "../../../../../lib/b2b/enrich-store-quote"
import { requireB2bFeature } from "../../../../../lib/b2b/settings-guard"
import { requireMemberPermission } from "../../../../../lib/security/rbac"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "quotes_enabled")
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    await requireMemberPermission(req.scope, context.member?.role, "quotes.view")
    const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
    const { id } = req.params

    const quote = await quoteService.retrieveWithItems(id)

    if (
      !customerCanAccessQuote(quote, {
        customerId,
        companyId: context.companyId,
        email: context.email,
      })
    ) {
      res.status(404).json({ message: "Quote not found" })
      return
    }

    res.json({
      quote: await enrichStoreQuoteResponse(req.scope, quote),
    })
  } catch (error) {
    if (error instanceof MedusaError) {
      if (error.type === MedusaError.Types.UNAUTHORIZED) {
        res.status(401).json({ message: error.message })
        return
      }

      if (error.type === MedusaError.Types.NOT_ALLOWED) {
        res.status(403).json({ message: error.message })
        return
      }
    }

    throw error
  }
}
