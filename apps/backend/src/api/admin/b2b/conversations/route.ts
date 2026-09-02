import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  enrichAdminConversationResponse,
  enrichAdminConversationResponses,
} from "../../../../lib/b2b/enrich-admin-conversation"
import { notifyConversationReply } from "../../../../lib/b2b/email/notifications"
import { auditFromRequest } from "../../../../lib/security/audit"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import { QUOTE_MODULE } from "../../../../modules/quote"
import QuoteModuleService from "../../../../modules/quote/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const status = req.query.status as
    | "open"
    | "closed"
    | "archived"
    | "all"
    | undefined
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const { conversations, count } = await b2bService.listConversationsForAdmin({
    status,
    limit,
    offset,
  })

  const enriched = await enrichAdminConversationResponses(
    req.scope,
    conversations
  )

  res.json({ conversations: enriched, count, limit, offset })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const logger = req.scope.resolve("logger")
  const body = (req.body || {}) as {
    subject: string
    company_id?: string | null
    quote_id?: string | null
    order_id?: string | null
    customer_id?: string | null
    initial_message?: string
    sender_name?: string | null
  }

  let companyId = body.company_id ?? null
  let customerId = body.customer_id ?? null

  if (body.quote_id) {
    try {
      const quoteService: QuoteModuleService = req.scope.resolve(QUOTE_MODULE)
      const quote = await quoteService.retrieveQuote(body.quote_id)
      companyId = companyId ?? quote.company_id ?? null
      customerId = customerId ?? quote.customer_id ?? null
    } catch {
      // keep provided ids
    }
  }

  const conversation = await b2bService.createConversation({
    subject: body.subject,
    company_id: companyId,
    quote_id: body.quote_id ?? null,
    order_id: body.order_id ?? null,
    customer_id: customerId,
    created_by: "admin",
    sender_type: "admin",
    sender_name: body.sender_name ?? "Admin",
    initial_message: body.initial_message,
  })

  let emailed = false

  if (body.initial_message?.trim()) {
    try {
      emailed = await notifyConversationReply(req.scope, {
        conversationId: conversation.id,
        body: body.initial_message.trim(),
        senderName: body.sender_name ?? "Admin",
      })
    } catch (error) {
      logger.error(
        `[b2b-email] conversation create notify failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "b2b.conversation.created",
    resource_type: "b2b_conversation",
    resource_id: conversation.id,
    company_id: companyId,
    summary: `Opened conversation "${body.subject}"`,
  })

  res.status(201).json({
    conversation: await enrichAdminConversationResponse(req.scope, conversation),
    emailed,
  })
}
