import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService, {
  AdminSendQuoteOfferInput,
} from "../../modules/quote/service"
import { resolveRegionCurrency } from "../../lib/b2b/medusa-integrations"

const adminSendQuoteOfferStep = createStep(
  "admin-send-quote-offer",
  async (input: AdminSendQuoteOfferInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const quote = await quoteService.retrieveQuote(input.quote_id)
    const currency =
      input.currency_code ??
      quote.currency_code ??
      (await resolveRegionCurrency(container, quote.region_id)) ??
      "gbp"

    const result = await quoteService.adminSendQuoteOffer({
      ...input,
      currency_code: currency,
    })

    const eventBus = container.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "quote.offer.sent",
      data: {
        id: result.id,
        email: result.email,
        company_id: result.company_id,
        offer_total: result.offer_total,
        currency_code: currency,
      },
    })

    return new StepResponse(result)
  }
)

export const adminSendQuoteOfferWorkflow = createWorkflow(
  "admin-send-quote-offer",
  (input: AdminSendQuoteOfferInput) => {
    const quote = adminSendQuoteOfferStep(input)
    return new WorkflowResponse(quote)
  }
)

export default adminSendQuoteOfferWorkflow
