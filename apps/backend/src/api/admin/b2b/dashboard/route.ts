import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import { QUOTE_MODULE } from "../../../../modules/quote"
import B2bModuleService from "../../../../modules/b2b/service"
import QuoteModuleService from "../../../../modules/quote/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)

  const [
    pendingCompanies,
    approvedCompanies,
    submittedQuotes,
    pendingApprovals,
    pendingApprovalsList,
    openConversations,
  ] = await Promise.all([
    b2bService.listCompaniesForAdmin({ status: "pending", limit: 5, offset: 0 }),
    b2bService.listCompaniesForAdmin({ status: "approved", limit: 1, offset: 0 }),
    quoteService.listQuotesForAdmin({ status: "submitted", limit: 200, offset: 0 }),
    b2bService.listOrderApprovalsForAdmin({ status: "pending", limit: 1, offset: 0 }),
    b2bService.listOrderApprovalsForAdmin({ status: "pending", limit: 5, offset: 0 }),
    b2bService.listConversationsForAdmin({ status: "open", limit: 1, offset: 0 }),
  ])

  const newQuotes = submittedQuotes.quotes.filter(
    (quote) => quote.b2b?.admin_status === "new" || !quote.b2b?.admin_status
  ).length

  const quotedOffers = submittedQuotes.quotes.filter(
    (quote) => quote.b2b?.admin_status === "quoted"
  ).length

  const inReviewQuotes = submittedQuotes.quotes.filter(
    (quote) => quote.b2b?.admin_status === "in_review"
  ).length

  const wonQuotes = submittedQuotes.quotes.filter(
    (quote) => quote.b2b?.admin_status === "won"
  ).length

  const lostQuotes = submittedQuotes.quotes.filter(
    (quote) => quote.b2b?.admin_status === "lost"
  ).length

  res.json({
    stats: {
      pending_companies: pendingCompanies.count,
      approved_companies: approvedCompanies.count,
      pending_order_approvals: pendingApprovals.count,
      open_conversations: openConversations.count,
      new_quotes: newQuotes,
      quoted_offers: quotedOffers,
      in_review_quotes: inReviewQuotes,
      total_submitted_quotes: submittedQuotes.count,
      won_quotes: wonQuotes,
      lost_quotes: lostQuotes,
    },
    pending_registrations: pendingCompanies.companies.map((company) => ({
      id: company.id,
      name: company.name,
      email: company.email,
      legal_name: company.legal_name,
      vat_number: company.vat_number,
      status: company.status,
      created_at: company.created_at,
      member_count: company.member_count ?? 0,
    })),
    pending_order_approvals: pendingApprovalsList.approvals,
  })
}
