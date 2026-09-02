import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import rejectOrderApprovalWorkflow from "../../../../../../workflows/b2b/reject-order-approval"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as {
    approved_by_member_id?: string | null
    notes?: string | null
  }

  const { result: approval } = await rejectOrderApprovalWorkflow(
    req.scope
  ).run({
    input: {
      approval_id: id,
      approved_by_member_id: body.approved_by_member_id,
      notes: body.notes,
    },
  })

  res.json({ approval })
}
