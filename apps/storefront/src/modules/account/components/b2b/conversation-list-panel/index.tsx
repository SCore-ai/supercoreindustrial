"use client"

import type { StoreB2bConversation } from "@lib/data/b2b-account"
import { useMemo, useState } from "react"

import ConversationList from "../conversation-list"

type ConversationListPanelProps = {
  conversations: StoreB2bConversation[]
  headerAction?: React.ReactNode
}

type StatusFilter = "all" | "open" | "closed"

const ConversationListPanel = ({
  conversations,
  headerAction,
}: ConversationListPanelProps) => {
  const [filter, setFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    if (filter === "all") {
      return conversations
    }

    return conversations.filter((conversation) => conversation.status === filter)
  }, [conversations, filter])

  const counts = useMemo(
    () => ({
      all: conversations.length,
      open: conversations.filter((c) => c.status === "open").length,
      closed: conversations.filter((c) => c.status === "closed").length,
    }),
    [conversations]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              ["all", "All"],
              ["open", "Open"],
              ["closed", "Closed"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                filter === value
                  ? "bg-sc-ink text-white"
                  : "border border-sc-line bg-white text-sc-steel hover:border-sc-steel"
              }`}
            >
              {label} ({counts[value]})
            </button>
          ))}
        </div>
        {headerAction}
      </div>

      <ConversationList conversations={filtered} />
    </div>
  )
}

export default ConversationListPanel
