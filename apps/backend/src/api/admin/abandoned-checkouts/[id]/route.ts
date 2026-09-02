import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  retrieveAbandonedCheckout,
  updateAbandonedCheckoutNotes,
} from "../../../../lib/abandoned-checkout/abandoned-checkout-service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const checkout = await retrieveAbandonedCheckout(req.scope, id)

  if (!checkout) {
    res.status(404).json({ message: "Abandoned checkout not found" })
    return
  }

  res.json({ checkout })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { admin_notes?: string | null }

  const existing = await retrieveAbandonedCheckout(req.scope, id)

  if (!existing) {
    res.status(404).json({ message: "Abandoned checkout not found" })
    return
  }

  const checkout = await updateAbandonedCheckoutNotes(
    req.scope,
    id,
    body.admin_notes ?? null
  )

  res.json({ checkout })
}
