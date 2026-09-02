import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import { enrichAdminConversationResponse } from "../../../../../../lib/b2b/enrich-admin-conversation"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params

  const conversation = await b2bService.restoreConversation(id)

  res.json({
    conversation: await enrichAdminConversationResponse(req.scope, conversation),
  })
}
