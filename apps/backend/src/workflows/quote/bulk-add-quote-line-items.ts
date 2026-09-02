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

export type BulkAddQuoteLineItemsInput = {
  quote_id: string
  items: AddQuoteLineItemInput[]
}

const bulkAddQuoteLineItemsStep = createStep(
  "bulk-add-quote-line-items",
  async (input: BulkAddQuoteLineItemsInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const lineItems = []

    for (const item of input.items) {
      const lineItem = await quoteService.addOrUpdateLineItem(item)
      lineItems.push(lineItem)
    }

    return new StepResponse(lineItems)
  }
)

export const bulkAddQuoteLineItemsWorkflow = createWorkflow(
  "bulk-add-quote-line-items",
  (input: BulkAddQuoteLineItemsInput) => {
    const lineItems = bulkAddQuoteLineItemsStep(input)
    return new WorkflowResponse(lineItems)
  }
)

export default bulkAddQuoteLineItemsWorkflow
