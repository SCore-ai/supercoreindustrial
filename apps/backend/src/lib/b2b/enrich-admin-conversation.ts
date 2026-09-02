import { MedusaContainer } from "@medusajs/framework/types"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { QUOTE_MODULE } from "../../modules/quote"
import QuoteModuleService from "../../modules/quote/service"

export type AdminConversationQuoteLink = {
  id: string | null
  status: "linked" | "removed" | "none"
  label: string
}

export async function resolveConversationQuoteLink(
  scope: MedusaContainer,
  conversation: {
    quote_id?: string | null
    metadata?: Record<string, unknown> | null
  }
): Promise<AdminConversationQuoteLink> {
  const metadata = (conversation.metadata ?? {}) as Record<string, unknown>
  const detachedQuoteId =
    typeof metadata.detached_quote_id === "string"
      ? metadata.detached_quote_id
      : null

  if (!conversation.quote_id) {
    if (detachedQuoteId) {
      return {
        id: detachedQuoteId,
        status: "removed",
        label: `Offer ${detachedQuoteId.slice(-8).toUpperCase()} (deleted)`,
      }
    }

    return {
      id: null,
      status: "none",
      label: "No linked offer",
    }
  }

  const quoteService = scope.resolve(QUOTE_MODULE) as QuoteModuleService

  try {
    await quoteService.retrieveQuote(conversation.quote_id)
    return {
      id: conversation.quote_id,
      status: "linked",
      label: `Offer ${conversation.quote_id.slice(-8).toUpperCase()}`,
    }
  } catch {
    const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
    await b2bService.detachQuoteFromConversations(conversation.quote_id)

    return {
      id: conversation.quote_id,
      status: "removed",
      label: `Offer ${conversation.quote_id.slice(-8).toUpperCase()} (deleted)`,
    }
  }
}

export async function enrichAdminConversationResponse(
  scope: MedusaContainer,
  conversation: Record<string, unknown>
) {
  const quoteLink = await resolveConversationQuoteLink(scope, {
    quote_id: conversation.quote_id as string | null | undefined,
    metadata: conversation.metadata as Record<string, unknown> | null,
  })

  return {
    ...conversation,
    quote_link: quoteLink,
  }
}

export async function enrichAdminConversationResponses(
  scope: MedusaContainer,
  conversations: Array<Record<string, unknown>>
) {
  const quoteIds = [
    ...new Set(
      conversations
        .map((conversation) => conversation.quote_id)
        .filter((quoteId): quoteId is string => typeof quoteId === "string")
    ),
  ]
  const quoteService = scope.resolve(QUOTE_MODULE) as QuoteModuleService
  const quotes = quoteIds.length
    ? await quoteService.listQuotes({ id: quoteIds })
    : []
  const existingQuoteIds = new Set(quotes.map((quote) => quote.id))

  return conversations.map((conversation) => {
    const metadata = (conversation.metadata ?? {}) as Record<string, unknown>
    const quoteId = conversation.quote_id as string | null | undefined
    const detachedQuoteId =
      typeof metadata.detached_quote_id === "string"
        ? metadata.detached_quote_id
        : null

    if (!quoteId) {
      return {
        ...conversation,
        quote_link: detachedQuoteId
          ? {
              id: detachedQuoteId,
              status: "removed" as const,
              label: `Offer ${detachedQuoteId.slice(-8).toUpperCase()} (deleted)`,
            }
          : { id: null, status: "none" as const, label: "No linked offer" },
      }
    }

    return {
      ...conversation,
      quote_link: existingQuoteIds.has(quoteId)
        ? {
            id: quoteId,
            status: "linked" as const,
            label: `Offer ${quoteId.slice(-8).toUpperCase()}`,
          }
        : {
            id: quoteId,
            status: "removed" as const,
            label: `Offer ${quoteId.slice(-8).toUpperCase()} (deleted)`,
          },
    }
  })
}
