import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../lib/b2b/customer-context"
import { memberCanApproveCompanyOrders } from "../../../../lib/b2b/order-approval-access"
import { memberCanManageMembers } from "../../../../lib/b2b/member-access"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)

    const { count: quoteCount } = await quoteService.listQuotesForCustomer({
      customer_id: customerId,
      email: context.email,
      company_id: context.companyId,
      limit: 1,
      offset: 0,
    })

    const { count: conversationCount } =
      await b2bService.listConversationsForCustomer({
        customer_id: customerId,
        company_id: context.companyId,
        limit: 1,
        offset: 0,
      })

    let pendingApprovals = 0

    if (context.companyId) {
      const { count } = await b2bService.listOrderApprovalsForCompany({
        company_id: context.companyId,
        status: "pending",
        limit: 1,
        offset: 0,
      })
      pendingApprovals = count
    }

    const canApproveOrders = memberCanApproveCompanyOrders(context.member)

    res.json({
      company: context.company
        ? {
            id: context.company.id,
            name: context.company.name,
            status: context.company.status,
            require_order_approval: context.company.require_order_approval,
          }
        : null,
      member: context.member
        ? {
            role: context.member.role,
            is_primary: context.member.is_primary,
          }
        : null,
      permissions: {
        can_approve_orders: canApproveOrders,
        can_manage_members: memberCanManageMembers(context.member),
      },
      counts: {
        quotes: quoteCount,
        conversations: conversationCount,
        pending_approvals: pendingApprovals,
      },
    })
  } catch (error) {
    if (
      error instanceof MedusaError &&
      error.type === MedusaError.Types.UNAUTHORIZED
    ) {
      res.status(401).json({ message: error.message })
      return
    }

    throw error
  }
}
