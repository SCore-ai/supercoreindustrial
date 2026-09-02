import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { removeAdminOrder } from "../../../../../lib/orders/admin-orders-service"
import {
  retrieveAdminOrderDetail,
  updateAdminOrder,
} from "../../../../../lib/orders/order-detail-service"
import type { UpdateAdminOrderInput } from "../../../../../lib/orders/types"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const order = await retrieveAdminOrderDetail(req.scope, id)
    res.json({ order })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order not found"
    res.status(message.includes("not found") ? 404 : 400).json({ message })
  }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as UpdateAdminOrderInput

  try {
    const order = await updateAdminOrder(req.scope, id, body)
    res.json({ order })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order"
    res.status(400).json({ message })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const result = await removeAdminOrder(req.scope, id)
    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove order"
    const status =
      message.toLowerCase().includes("not found") ? 404 : 400
    res.status(status).json({ message })
  }
}
