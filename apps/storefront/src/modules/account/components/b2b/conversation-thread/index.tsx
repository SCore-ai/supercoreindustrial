"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  replyToB2bConversation,
  type StoreB2bConversation,
} from "@lib/data/b2b-account"

import ConversationStatusBadge from "../conversation-status-badge"

type ConversationThreadProps = {
  conversation: StoreB2bConversation
  customerName?: string | null
}

const ConversationThread = ({
  conversation,
  customerName,
}: ConversationThreadProps) => {
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const entries = conversation.messages ?? []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [entries.length])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!message.trim()) {
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        await replyToB2bConversation({
          conversationId: conversation.id,
          body: message.trim(),
          sender_name: customerName ?? undefined,
        })
        setMessage("")
        router.refresh()
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not send message"
        )
      }
    })
  }

  return (
    <div className="flex min-h-[480px] flex-col rounded-xl border border-sc-line bg-white">
      <header className="border-b border-sc-line px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-sc-ink">
              {conversation.subject}
            </h2>
            <p className="mt-1 text-xs text-sc-steel">
              Started{" "}
              {conversation.created_at
                ? new Date(conversation.created_at).toLocaleString()
                : "—"}
            </p>
          </div>
          <ConversationStatusBadge status={conversation.status} />
        </div>
        {conversation.quote_id && (
          <p className="mt-3 text-xs text-sc-steel">
            Linked quote:{" "}
            <span className="font-mono text-sc-body">{conversation.quote_id}</span>
          </p>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {!entries.length && (
          <p className="text-center text-sm text-sc-steel">
            No messages in this thread yet.
          </p>
        )}

        {entries.map((entry) => {
          const isCustomer = entry.sender_type === "customer"

          return (
            <div
              key={entry.id}
              className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isCustomer
                    ? "rounded-br-md bg-sc-cta/15 text-sc-body"
                    : entry.sender_type === "system"
                      ? "rounded-bl-md bg-sc-paper text-sc-steel italic"
                      : "rounded-bl-md bg-sc-paper text-sc-body"
                }`}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sc-steel">
                  {entry.sender_name ||
                    (entry.sender_type === "admin"
                      ? "Supercore team"
                      : entry.sender_type)}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{entry.body}</p>
                {entry.created_at && (
                  <p className="mt-2 text-[11px] text-sc-steel">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {conversation.status === "open" ? (
        <form
          onSubmit={handleSubmit}
          className="border-t border-sc-line px-5 py-4"
        >
          <label htmlFor="reply" className="mb-2 block text-sm font-medium text-sc-body">
            Your reply
          </label>
          <textarea
            id="reply"
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full rounded-lg border border-sc-line px-3 py-2 text-sm focus:border-sc-cta focus:outline-none focus:ring-2 focus:ring-sc-cta/20"
            placeholder="Write your message..."
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isPending || !message.trim()}
              className="rounded-lg bg-sc-cta px-5 py-2.5 text-sm font-semibold text-sc-ink transition-colors hover:bg-sc-cta-hover disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      ) : (
        <div className="border-t border-sc-line bg-sc-paper px-5 py-4 text-sm text-sc-steel">
          This conversation is closed. Contact sales to reopen if you need further
          assistance.
        </div>
      )}
    </div>
  )
}

export default ConversationThread
