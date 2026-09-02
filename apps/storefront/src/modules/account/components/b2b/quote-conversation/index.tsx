"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { StoreB2bConversation } from "@lib/data/b2b-account"

import NewConversationForm from "../new-conversation-form"

type QuoteConversationProps = {
  quoteId: string
  quoteLabel: string
  conversations: StoreB2bConversation[]
  customerName?: string | null
  conversationsEnabled?: boolean
}

const QuoteConversation = ({
  quoteId,
  quoteLabel,
  conversations,
  customerName,
  conversationsEnabled = true,
}: QuoteConversationProps) => {
  if (!conversationsEnabled) {
    return null
  }

  const linked = conversations.filter(
    (conversation) => conversation.quote_id === quoteId
  )

  return (
    <section className="rounded-xl border border-sc-line bg-white p-6">
      <h3 className="font-display text-base font-semibold text-sc-ink">
        Messages about this quote
      </h3>
      <p className="mt-1 text-sm text-sc-steel">
        Ask our team about pricing, lead times, or specifications for this quote.
      </p>

      {linked.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {linked.map((conversation) => (
            <li key={conversation.id}>
              <LocalizedClientLink
                href={`/account/trade/messages/${conversation.id}`}
                className="flex items-center justify-between rounded-lg border border-sc-line px-4 py-3 text-sm transition-colors hover:border-sc-cta hover:bg-sc-paper"
              >
                <span className="font-medium text-sc-body">
                  {conversation.subject}
                </span>
                <span className="text-xs uppercase text-sc-steel">
                  {conversation.status}
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-sc-steel">
          No messages linked to this quote yet.
        </p>
      )}

      <div className="mt-4">
        <NewConversationForm
          defaultQuoteId={quoteId}
          defaultSubject={`Question about ${quoteLabel}`}
          customerName={customerName}
          triggerLabel={
            linked.length ? "Start another message" : "Message about this quote"
          }
          triggerClassName="rounded-lg border border-sc-line bg-white px-4 py-2.5 text-sm font-semibold text-sc-body transition-colors hover:border-sc-cta hover:text-sc-cta"
        />
      </div>
    </section>
  )
}

export default QuoteConversation
