import {
  conversationStatusLabel,
  conversationStatusTone,
} from "@lib/b2b/account-labels"
import type { StoreB2bConversation } from "@lib/data/b2b-account"

const ConversationStatusBadge = ({
  status,
}: {
  status: StoreB2bConversation["status"]
}) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${conversationStatusTone(status)}`}
  >
    {conversationStatusLabel(status)}
  </span>
)

export default ConversationStatusBadge
