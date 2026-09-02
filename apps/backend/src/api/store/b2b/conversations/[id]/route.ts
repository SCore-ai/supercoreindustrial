import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../lib/b2b/customer-context"
import { requireB2bFeature } from "../../../../../lib/b2b/settings-guard"
import { requireAnyB2bPermission } from "../../../../../lib/security/rbac"

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
    const { id } = req.params
    const conversation = await b2bService.retrieveConversationWithMessages(id)

    if (
      !(await b2bService.customerCanAccessConversation(conversation, {
        customerId,
        companyId: context.companyId,
        quoteIds: context.quoteIds,
      }))
    ) {
      res.status(404).json({ message: "Conversation not found" })
      return
    }

    res.json({ conversation })
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
    const { id } = req.params
    const body = (req.body || {}) as {
      body: string
      sender_name?: string | null
    }

    const existing = await b2bService.retrieveB2bConversation(id)

    if (
      !(await b2bService.customerCanAccessConversation(existing, {
        customerId,
        companyId: context.companyId,
        quoteIds: context.quoteIds,
      }))
    ) {
      res.status(404).json({ message: "Conversation not found" })
      return
    }

    const message = await b2bService.addMessage({
      conversation_id: id,
      body: body.body,
      sender_type: "customer",
      sender_id: customerId,
      sender_name: body.sender_name ?? "Customer",
    })

    const conversation = await b2bService.retrieveConversationWithMessages(id)
    res.status(201).json({ message, conversation })
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
