import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"

type UpdateQuoteLineItemInput = {
  line_id: string
  quantity: number
}

const updateQuoteLineItem = createStep(
  "update-quote-line-item",
  async (input: UpdateQuoteLineItemInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const lineItem = await quoteService.updateQuoteLineItems({
      id: input.line_id,
      quantity: input.quantity,
    })
    return new StepResponse(lineItem)
  }
)

export const updateQuoteLineItemWorkflow = createWorkflow(
  "update-quote-line-item",
  (input: UpdateQuoteLineItemInput) => {
    const lineItem = updateQuoteLineItem(input)
    return new WorkflowResponse(lineItem)
  }
)

export default updateQuoteLineItemWorkflow
