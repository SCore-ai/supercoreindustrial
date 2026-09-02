"use client"

import { Dialog, Transition } from "@headlessui/react"
import { createB2bConversation } from "@lib/data/b2b-account"
import type { StoreB2bQuoteSummary } from "@lib/data/b2b-account"
import { useParams, useRouter } from "next/navigation"
import { Fragment, useState, useTransition } from "react"

type NewConversationFormProps = {
  quotes?: StoreB2bQuoteSummary[]
  defaultQuoteId?: string
  defaultSubject?: string
  customerName?: string | null
  triggerClassName?: string
  triggerLabel?: string
}

const NewConversationForm = ({
  quotes = [],
  defaultQuoteId,
  defaultSubject = "",
  customerName,
  triggerClassName,
  triggerLabel = "New message",
}: NewConversationFormProps) => {
  const router = useRouter()
  const countryCode = useParams().countryCode as string
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(defaultSubject)
  const [quoteId, setQuoteId] = useState(defaultQuoteId ?? "")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const openDialog = () => {
    setSubject(defaultSubject)
    setQuoteId(defaultQuoteId ?? "")
    setMessage("")
    setError(null)
    setOpen(true)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.")
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        const conversation = await createB2bConversation({
          subject: subject.trim(),
          quote_id: quoteId || null,
          initial_message: message.trim(),
          sender_name: customerName ?? undefined,
        })

        setOpen(false)
        router.push(`/${countryCode}/account/trade/messages/${conversation.id}`)
        router.refresh()
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Could not create conversation"
        )
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={
          triggerClassName ??
          "rounded-lg bg-sc-cta px-4 py-2.5 text-sm font-semibold text-sc-ink transition-colors hover:bg-sc-cta-hover"
        }
      >
        {triggerLabel}
      </button>

      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-sc-ink/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-xl border border-sc-line bg-white p-6 shadow-xl">
                <Dialog.Title className="font-display text-lg font-semibold text-sc-ink">
                  New message
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-sc-steel">
                  Start a conversation with our sales and support team.
                </Dialog.Description>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="conversation-subject"
                      className="mb-1.5 block text-sm font-medium text-sc-body"
                    >
                      Subject
                    </label>
                    <input
                      id="conversation-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg border border-sc-line px-3 py-2 text-sm focus:border-sc-cta focus:outline-none focus:ring-2 focus:ring-sc-cta/20"
                      placeholder="e.g. Question about quote delivery"
                      required
                    />
                  </div>

                  {quotes.length > 0 && (
                    <div>
                      <label
                        htmlFor="conversation-quote"
                        className="mb-1.5 block text-sm font-medium text-sc-body"
                      >
                        Related quote (optional)
                      </label>
                      <select
                        id="conversation-quote"
                        value={quoteId}
                        onChange={(e) => setQuoteId(e.target.value)}
                        className="w-full rounded-lg border border-sc-line px-3 py-2 text-sm focus:border-sc-cta focus:outline-none focus:ring-2 focus:ring-sc-cta/20"
                      >
                        <option value="">None</option>
                        {quotes.map((quote) => (
                          <option key={quote.id} value={quote.id}>
                            {quote.company || quote.project || quote.id.slice(-8)}
                            {quote.admin_status
                              ? ` — ${quote.admin_status.replace("_", " ")}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="conversation-message"
                      className="mb-1.5 block text-sm font-medium text-sc-body"
                    >
                      Message
                    </label>
                    <textarea
                      id="conversation-message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg border border-sc-line px-3 py-2 text-sm focus:border-sc-cta focus:outline-none focus:ring-2 focus:ring-sc-cta/20"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-lg border border-sc-line px-4 py-2 text-sm font-medium text-sc-body hover:border-sc-steel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-lg bg-sc-cta px-4 py-2 text-sm font-semibold text-sc-ink hover:bg-sc-cta-hover disabled:opacity-50"
                    >
                      {isPending ? "Sending..." : "Send message"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default NewConversationForm
