import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendAbandonedCheckoutRecoveryEmail } from "../../../../../lib/abandoned-checkout/send-recovery-email"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { to?: string | null }

  try {
    const result = await sendAbandonedCheckoutRecoveryEmail(req.scope, id, {
      to: body.to,
    })

    res.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send recovery email"

    res.status(400).json({ message })
  }
}
