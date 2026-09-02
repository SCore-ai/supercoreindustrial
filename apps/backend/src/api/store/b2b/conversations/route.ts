import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../lib/b2b/customer-context"
import { requireB2bFeature } from "../../../../lib/b2b/settings-guard"
import { auditFromRequest } from "../../../../lib/security/audit"
import { requireAnyB2bPermission } from "../../../../lib/security/rbac"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "conversations_enabled")
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    if (context.member?.role) {
      await requireAnyB2bPermission(req.scope, context.member.role, [
        "conversations.view",
        "conversations.manage",
      ])
    }
    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)

    const limit = req.query.limit ? Number(req.query.limit) : 20
    const offset = req.query.offset ? Number(req.query.offset) : 0

    const { conversations, count } =
      await b2bService.listConversationsForCustomer({
        customer_id: customerId,
        company_id: context.companyId,
        quote_ids: context.quoteIds,
        limit,
        offset,
      })

    const latestMessages = await b2bService.listLatestMessagesForConversations(
      conversations.map((conversation) => conversation.id)
    )
    const enriched = conversations.map((conversation) => ({
      ...conversation,
      last_message: latestMessages.get(conversation.id) ?? null,
    }))

    res.json({ conversations: enriched, count, limit, offset })
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

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    await requireB2bFeature(req.scope, "conversations_enabled")
    const customerId = requireAuthenticatedCustomer(req)
    const context = await resolveStoreB2bContext(req.scope, customerId)
    if (context.member?.role) {
      await requireAnyB2bPermission(req.scope, context.member.role, [
        "conversations.view",
        "conversations.manage",
      ])
    }
    const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
    const body = (req.body || {}) as {
      subject: string
      quote_id?: string | null
      order_id?: string | null
      initial_message?: string
      sender_name?: string | null
    }

    const conversation = await b2bService.createConversation({
      subject: body.subject,
      company_id: context.companyId,
      quote_id: body.quote_id ?? null,
      order_id: body.order_id ?? null,
      customer_id: customerId,
      initial_message: body.initial_message,
      created_by: "customer",
      sender_type: "customer",
      sender_name: body.sender_name ?? "Customer",
    })

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: customerId,
      actor_email: context.email,
      action: "b2b.conversation.created",
      resource_type: "b2b_conversation",
      resource_id: conversation.id,
      company_id: context.companyId,
      summary: `Opened conversation "${body.subject}"`,
    })

    res.status(201).json({ conversation })
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
