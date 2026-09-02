import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { enrichAdminConversationResponse } from "../../../../../lib/b2b/enrich-admin-conversation"
import { notifyConversationReply } from "../../../../../lib/b2b/email/notifications"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params
  const conversation = await b2bService.retrieveConversationWithMessages(id)

  res.json({
    conversation: await enrichAdminConversationResponse(req.scope, conversation),
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params

  const result = await b2bService.deleteConversation(id)
  res.status(200).json(result)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const logger = req.scope.resolve("logger")
  const { id } = req.params
  const body = (req.body || {}) as {
    body: string
    sender_name?: string | null
  }

  if (!body.body?.trim()) {
    res.status(400).json({ message: "Reply body is required" })
    return
  }

  const message = await b2bService.addMessage({
    conversation_id: id,
    body: body.body.trim(),
    sender_type: "admin",
    sender_name: body.sender_name ?? "Admin",
  })

  let emailed = false

  try {
    emailed = await notifyConversationReply(req.scope, {
      conversationId: id,
      body: body.body.trim(),
      senderName: body.sender_name ?? "Admin",
    })
  } catch (error) {
    logger.error(
      `[b2b-email] conversation reply notify failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  const conversation = await b2bService.retrieveConversationWithMessages(id)
  res.status(201).json({
    message,
    conversation: await enrichAdminConversationResponse(req.scope, conversation),
    emailed,
  })
}
