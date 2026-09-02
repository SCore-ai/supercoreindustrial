import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../../modules/b2b/service"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { memberId } = req.params

  const result = await b2bService.removeMember(memberId)
  res.status(200).json(result)
}
