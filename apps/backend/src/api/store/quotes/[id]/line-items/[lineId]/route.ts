import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deleteQuoteLineItemWorkflow } from "../../../../../../workflows/quote/delete-quote-line-item"
import { updateQuoteLineItemWorkflow } from "../../../../../../workflows/quote/update-quote-line-item"

type UpdateLineItemBody = {
  quantity: number
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const { lineId } = req.params
  const body = req.body as UpdateLineItemBody

  if (!body?.quantity || body.quantity < 1) {
    res.status(400).json({ message: "quantity must be at least 1" })
    return
  }

  const { result: lineItem } = await updateQuoteLineItemWorkflow(req.scope).run({
    input: {
      line_id: lineId,
      quantity: body.quantity,
    },
  })

  res.json({ line_item: lineItem })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { lineId } = req.params

  const { result } = await deleteQuoteLineItemWorkflow(req.scope).run({
    input: { line_id: lineId },
  })

  res.status(200).json(result)
}
