import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const status = req.query.status as
    | "pending"
    | "approved"
    | "rejected"
    | undefined
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const { approvals, count } = await b2bService.listOrderApprovalsForAdmin({
    status,
    limit,
    offset,
  })

  res.json({ approvals, count, limit, offset })
}
