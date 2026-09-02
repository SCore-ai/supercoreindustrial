import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  createDraftTestOrder,
  listAdminOrders,
} from "../../../../lib/orders/admin-orders-service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.query as {
    limit?: string
    offset?: string
    status?: string
    q?: string
    test_drafts_only?: string
  }

  const result = await listAdminOrders(req.scope, {
    limit: query.limit ? Number(query.limit) : undefined,
    offset: query.offset ? Number(query.offset) : undefined,
    status: query.status,
    q: query.q,
    test_drafts_only: query.test_drafts_only === "true",
  })

  res.json(result)
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { action?: string }

  if (body.action !== "create_draft") {
    res.status(400).json({ message: "Unsupported action" })
    return
  }

  const order = await createDraftTestOrder(req.scope)
  res.status(201).json({ order })
}
