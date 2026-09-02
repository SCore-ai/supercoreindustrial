import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"

type DeleteQuoteLineItemInput = {
  line_id: string
}

const deleteQuoteLineItem = createStep(
  "delete-quote-line-item",
  async (input: DeleteQuoteLineItemInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    await quoteService.deleteQuoteLineItems(input.line_id)
    return new StepResponse({ id: input.line_id, deleted: true })
  }
)

export const deleteQuoteLineItemWorkflow = createWorkflow(
  "delete-quote-line-item",
  (input: DeleteQuoteLineItemInput) => {
    const result = deleteQuoteLineItem(input)
    return new WorkflowResponse(result)
  }
)

export default deleteQuoteLineItemWorkflow
