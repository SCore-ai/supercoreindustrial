import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  archiveAdminOrder,
  cancelAdminOrder,
  duplicateAdminOrder,
  removeOrderCustomer,
} from "../../../../../../lib/orders/order-detail-service"
import type { OrderActionType } from "../../../../../../lib/orders/types"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { action?: OrderActionType }

  try {
    switch (body.action) {
      case "duplicate": {
        const order = await duplicateAdminOrder(req.scope, id)
        res.status(201).json({ order })
        return
      }
      case "cancel": {
        const order = await cancelAdminOrder(req.scope, id)
        res.json({ order })
        return
      }
      case "archive": {
        const order = await archiveAdminOrder(req.scope, id)
        res.json({ order })
        return
      }
      case "remove_customer": {
        const order = await removeOrderCustomer(req.scope, id)
        res.json({ order })
        return
      }
      default:
        res.status(400).json({ message: "Unsupported action" })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed"
    res.status(400).json({ message })
  }
}
