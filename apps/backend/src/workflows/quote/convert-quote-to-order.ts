import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  convertQuoteToOrder,
  ConvertQuoteToOrderResult,
} from "../../lib/b2b/quote-to-order"

type ConvertQuoteToOrderInput = {
  quote_id: string
  admin_notes?: string | null
}

const convertQuoteToOrderStep = createStep(
  "convert-quote-to-order",
  async (input: ConvertQuoteToOrderInput, { container }) => {
    const result = await convertQuoteToOrder(container, input.quote_id, {
      admin_notes: input.admin_notes,
    })
    return new StepResponse(result)
  }
)

export const convertQuoteToOrderWorkflow = createWorkflow(
  "convert-quote-to-order",
  (input: ConvertQuoteToOrderInput) => {
    const result = convertQuoteToOrderStep(input)
    return new WorkflowResponse(result)
  }
)

export default convertQuoteToOrderWorkflow

export type { ConvertQuoteToOrderResult }
