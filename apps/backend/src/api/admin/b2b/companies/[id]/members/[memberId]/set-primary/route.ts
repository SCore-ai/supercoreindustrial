import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../../../modules/b2b/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id, memberId } = req.params

  const company = await b2bService.setPrimaryContact(id, memberId)
  res.status(200).json({ company })
}
