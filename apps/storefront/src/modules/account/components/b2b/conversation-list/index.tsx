import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { StoreB2bConversation } from "@lib/data/b2b-account"

import ConversationStatusBadge from "../conversation-status-badge"

const ConversationList = ({
  conversations,
}: {
  conversations: StoreB2bConversation[]
}) => {
  if (!conversations.length) {
    return (
      <div className="rounded-xl border border-dashed border-sc-line bg-white p-10 text-center">
        <p className="text-base font-medium text-sc-body">No messages yet.</p>
        <p className="mt-2 text-sm text-sc-steel">
          Start a new message or open a conversation from a quote detail page.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-sc-line bg-white divide-y divide-sc-line">
      {conversations.map((conversation) => {
        const preview =
          conversation.last_message?.body ??
          conversation.messages?.[conversation.messages.length - 1]?.body

        return (
          <LocalizedClientLink
            key={conversation.id}
            href={`/account/trade/messages/${conversation.id}`}
            className="block px-5 py-4 transition-colors hover:bg-sc-paper"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sc-body truncate">
                    {conversation.subject}
                  </p>
                  <ConversationStatusBadge status={conversation.status} />
                  {conversation.quote_id && (
                    <span className="rounded-full bg-sc-paper px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sc-steel ring-1 ring-sc-line">
                      Quote linked
                    </span>
                  )}
                </div>
                {preview && (
                  <p className="mt-2 line-clamp-2 text-sm text-sc-steel">
                    {preview}
                  </p>
                )}
              </div>
              <time
                className="shrink-0 text-xs text-sc-steel"
                dateTime={conversation.updated_at ?? conversation.created_at}
              >
                {conversation.updated_at || conversation.created_at
                  ? new Date(
                      conversation.updated_at ?? conversation.created_at!
                    ).toLocaleDateString()
                  : ""}
              </time>
            </div>
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}

export default ConversationList
