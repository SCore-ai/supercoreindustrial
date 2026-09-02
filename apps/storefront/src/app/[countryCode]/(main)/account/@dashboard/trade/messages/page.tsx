import { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { listB2bConversations } from "@lib/data/b2b-account"
import { retrieveCustomer } from "@lib/data/customer"
import ConversationList from "@modules/account/components/b2b/conversation-list"

export const metadata: Metadata = {
  title: "Messages",
  description: "Trade account messages",
}

export default async function TradeMessagesPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const settings = await fetchStoreB2bSettings()

  if (settings?.features.conversations === false) {
    notFound()
  }

  const conversations = await listB2bConversations()

  return (
    <div>
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">Messages</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          Conversations with our sales and support team.
        </p>
      </div>
      <ConversationList conversations={conversations} />
    </div>
  )
}
