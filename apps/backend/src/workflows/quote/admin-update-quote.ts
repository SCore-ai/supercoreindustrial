import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService, {
  AdminUpdateQuoteInput,
} from "../../modules/quote/service"

const adminUpdateQuoteStep = createStep(
  "admin-update-quote",
  async (input: AdminUpdateQuoteInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const quote = await quoteService.adminUpdateQuote(input)
    return new StepResponse(quote)
  }
)

export const adminUpdateQuoteWorkflow = createWorkflow(
  "admin-update-quote",
  (input: AdminUpdateQuoteInput) => {
    const quote = adminUpdateQuoteStep(input)
    return new WorkflowResponse(quote)
  }
)

export default adminUpdateQuoteWorkflow
