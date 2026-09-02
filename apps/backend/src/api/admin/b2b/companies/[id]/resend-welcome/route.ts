import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { resendTradeAccountWelcomeEmail } from "../../../../../../lib/b2b/resend-trade-account-welcome"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const result = await resendTradeAccountWelcomeEmail(req.scope, id)
    res.json(result)
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to send email",
    })
  }
}
