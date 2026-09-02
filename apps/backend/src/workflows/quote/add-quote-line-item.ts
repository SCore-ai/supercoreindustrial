import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService, {
  AddQuoteLineItemInput,
} from "../../modules/quote/service"

const addQuoteLineItem = createStep(
  "add-quote-line-item",
  async (input: AddQuoteLineItemInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const lineItem = await quoteService.addOrUpdateLineItem(input)
    return new StepResponse(lineItem)
  }
)

export const addQuoteLineItemWorkflow = createWorkflow(
  "add-quote-line-item",
  (input: AddQuoteLineItemInput) => {
    const lineItem = addQuoteLineItem(input)
    return new WorkflowResponse(lineItem)
  }
)

export default addQuoteLineItemWorkflow
