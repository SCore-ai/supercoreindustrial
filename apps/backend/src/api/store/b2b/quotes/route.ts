import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../lib/b2b/customer-context"
import { toStoreQuoteSummary } from "../../../../lib/b2b/enrich-store-quote"
import { requireB2bFeature } from "../../../../lib/b2b/settings-guard"
import { requireMemberPermission } from "../../../../lib/security/rbac"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "quotes_enabled")
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    await requireMemberPermission(req.scope, context.member?.role, "quotes.view")
    const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)

    const limit = req.query.limit ? Number(req.query.limit) : 20
    const offset = req.query.offset ? Number(req.query.offset) : 0

    const { quotes, count } = await quoteService.listQuotesForCustomer({
      customer_id: customerId,
      email: context.email,
      company_id: context.companyId,
      limit,
      offset,
    })

    res.json({
      quotes: quotes.map((quote) => toStoreQuoteSummary(quote)),
      count,
      limit,
      offset,
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
