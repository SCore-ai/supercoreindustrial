"use client"

import { submitQuote } from "@lib/data/quotes"
import { Button, Text } from "@modules/common/components/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

const SubmitQuoteForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await submitQuote({
        email: String(formData.get("email") || ""),
        company: String(formData.get("company") || "") || undefined,
        project: String(formData.get("project") || "") || undefined,
        notes: String(formData.get("notes") || "") || undefined,
      })
      setSubmitted(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white p-6 border border-ui-border-base rounded-lg">
        <Text className="txt-medium-plus text-ui-fg-base">
          Quote submitted
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular mt-2">
          Our team will review your request and respond with pricing and
          availability.
        </Text>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 border border-ui-border-base rounded-lg flex flex-col gap-y-4"
      data-testid="submit-quote-form"
    >
      <Text className="txt-medium-plus text-ui-fg-base">Submit quote request</Text>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Work email *</span>
        <input
          name="email"
          type="email"
          required
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Company</span>
        <input
          name="company"
          type="text"
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Project / site</span>
        <input
          name="project"
          type="text"
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={4}
          className="px-3 py-2 border border-ui-border-base rounded-md"
        />
      </label>

      <ErrorMessage error={error} />

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        data-testid="submit-quote-button"
      >
        Submit quote request
      </Button>
    </form>
  )
}

export default SubmitQuoteForm
