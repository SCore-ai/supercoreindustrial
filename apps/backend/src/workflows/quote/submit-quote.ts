import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService, {
  SubmitQuoteInput,
} from "../../modules/quote/service"

type SubmitQuoteWorkflowInput = SubmitQuoteInput & {
  quote_id: string
}

const submitQuote = createStep(
  "submit-quote",
  async (input: SubmitQuoteWorkflowInput, { container }) => {
    const quoteService: QuoteModuleService = container.resolve(QUOTE_MODULE)
    const b2bService: B2bModuleService = container.resolve(B2B_MODULE)
    const { quote_id, ...contact } = input

    const linkedCompany = await b2bService.upsertCompanyFromQuote({
      email: contact.email,
      company: contact.company,
      customer_id: contact.customer_id,
    })

    const quote = await quoteService.submitQuote(
      quote_id,
      contact,
      linkedCompany.id
    )

    const settings = await b2bService.getSettings()

    if (settings.conversations_enabled) {
      const shortId = quote.id.slice(-8).toUpperCase()
      const notes = contact.notes?.trim()
      const project = contact.project?.trim()
      const initialParts = [
        `Quote request #${shortId} was submitted.`,
        project ? `Project: ${project}` : null,
        notes ? `Notes: ${notes}` : null,
      ].filter(Boolean)

      await b2bService.createConversation({
        subject: `Quote request #${shortId}`,
        quote_id: quote.id,
        company_id: linkedCompany.id,
        customer_id: contact.customer_id ?? null,
        created_by: "customer",
        initial_message: initialParts.join("\n"),
        sender_type: "customer",
        sender_name: contact.company?.trim() || contact.email,
      })
    }

    const eventBus = container.resolve(Modules.EVENT_BUS)
    await eventBus.emit({
      name: "quote.submitted",
      data: {
        id: quote.id,
        email: quote.email,
        company: quote.company,
        company_id: quote.company_id,
        region_id: quote.region_id,
      },
    })

    return new StepResponse(quote)
  }
)

export const submitQuoteWorkflow = createWorkflow(
  "submit-quote",
  (input: SubmitQuoteWorkflowInput) => {
    const quote = submitQuote(input)
    return new WorkflowResponse(quote)
  }
)

export default submitQuoteWorkflow
