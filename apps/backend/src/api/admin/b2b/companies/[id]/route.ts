import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params
  const company = await b2bService.retrieveCompanyWithMembers(id)
  res.json({ company })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params
  const body = (req.body || {}) as Record<string, unknown>

  const company = await b2bService.updateCompany({
    id,
    ...(body as never),
  })

  res.json({ company })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params

  await b2bService.deleteCompany(id)
  res.status(200).json({ id, deleted: true })
}
