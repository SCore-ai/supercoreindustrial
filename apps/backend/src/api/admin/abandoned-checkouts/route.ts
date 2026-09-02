import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listAbandonedCheckouts } from "../../../lib/abandoned-checkout/abandoned-checkout-service"
import { AbandonedCheckoutRecoveryStatus } from "../../../lib/abandoned-checkout/types"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const recoveryStatus = req.query.recovery_status as
    | AbandonedCheckoutRecoveryStatus
    | "all"
    | undefined
  const q = req.query.q as string | undefined
  const limit = req.query.limit ? Number(req.query.limit) : 20
  const offset = req.query.offset ? Number(req.query.offset) : 0

  const result = await listAbandonedCheckouts(req.scope, {
    recovery_status: recoveryStatus ?? "all",
    q,
    limit,
    offset,
  })

  res.json(result)
}
