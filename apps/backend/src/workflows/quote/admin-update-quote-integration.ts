import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { QuoteErpMetadata } from "../../lib/b2b/quote-integration"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"

type AdminUpdateQuoteIntegrationInput = {
  quote_id: string
  erp: QuoteErpMetadata
}

const adminUpdateQuoteIntegrationStep = createStep(
  "admin-update-quote-integration",
  async (input: AdminUpdateQuoteIntegrationInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const quote = await quoteService.adminUpdateQuoteIntegration(
      input.quote_id,
      input.erp
    )
    return new StepResponse(quote)
  }
)

export const adminUpdateQuoteIntegrationWorkflow = createWorkflow(
  "admin-update-quote-integration",
  (input: AdminUpdateQuoteIntegrationInput) => {
    const quote = adminUpdateQuoteIntegrationStep(input)
    return new WorkflowResponse(quote)
  }
)

export default adminUpdateQuoteIntegrationWorkflow
