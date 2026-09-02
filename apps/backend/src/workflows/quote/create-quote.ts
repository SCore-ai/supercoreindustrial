import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"

type CreateQuoteInput = {
  region_id?: string | null
}

const createQuote = createStep(
  "create-quote",
  async (input: CreateQuoteInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const [quote] = await quoteService.createQuotes([
      {
        status: "draft",
        region_id: input.region_id ?? null,
      },
    ])

    return new StepResponse(quote)
  }
)

export const createQuoteWorkflow = createWorkflow(
  "create-quote",
  (input: CreateQuoteInput) => {
    const quote = createQuote(input)
    return new WorkflowResponse(quote)
  }
)

export default createQuoteWorkflow
