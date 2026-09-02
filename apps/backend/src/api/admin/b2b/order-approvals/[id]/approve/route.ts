import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import approveOrderApprovalWorkflow from "../../../../../../workflows/b2b/approve-order-approval"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as {
    approved_by_member_id?: string | null
    notes?: string | null
  }

  const { result: approval } = await approveOrderApprovalWorkflow(
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
