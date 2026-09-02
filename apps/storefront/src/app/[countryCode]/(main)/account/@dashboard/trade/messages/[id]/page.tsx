import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { retrieveB2bConversation } from "@lib/data/b2b-account"
import { retrieveCustomer } from "@lib/data/customer"
import ConversationThread from "@modules/account/components/b2b/conversation-thread"

export const metadata: Metadata = {
  title: "Message thread",
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function TradeMessageDetailPage({ params }: PageProps) {
  const { id } = await params
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const settings = await fetchStoreB2bSettings()

  if (settings?.features.conversations === false) {
    notFound()
  }

  const conversation = await retrieveB2bConversation(id)

  if (!conversation) {
    notFound()
  }

  return (
    <div>
      <LocalizedClientLink
        href="/account/trade/messages"
        className="mb-6 inline-block text-sm text-[var(--sc-accent)] hover:underline"
      >
        Back to messages
      </LocalizedClientLink>
      <ConversationThread conversation={conversation} />
    </div>
  )
}
