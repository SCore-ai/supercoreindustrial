"use client"

import {
  sendTradeRegistrationVerification,
  submitTradeRegistration,
  verifyTradeRegistrationCode,
} from "@lib/data/b2b"
import { Button, Text } from "@modules/common/components/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { FormEvent, useState } from "react"

type Step = "email" | "verify" | "details" | "done"

const TradeRegistrationForm = ({
  autoApprove = false,
}: {
  autoApprove?: boolean
}) => {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await sendTradeRegistrationVerification(email)
      setStep("verify")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send verification code"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await verifyTradeRegistrationCode({
        email,
        code: verificationCode,
      })
      setVerificationToken(result.verification_token)
      setStep("details")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitRegistration = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!verificationToken) {
      setError("Email verification expired. Start again.")
      setStep("email")
      setIsSubmitting(false)
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      await submitTradeRegistration({
        company_name: String(formData.get("company_name") || ""),
        contact_name: String(formData.get("contact_name") || ""),
        email,
        phone: String(formData.get("phone") || "") || undefined,
        vat_number: String(formData.get("vat_number") || "") || undefined,
        message: String(formData.get("message") || "") || undefined,
        verification_token: verificationToken,
      })
      setStep("done")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit registration"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "done") {
    return (
      <div className="bg-white p-6 border border-ui-border-base rounded-lg">
        <Text className="txt-medium-plus text-ui-fg-base">
          {autoApprove ? "Trade account created" : "Registration submitted"}
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular mt-2">
          {autoApprove
            ? "Your trade account is approved. Check your email for sign-in instructions."
            : "Thank you for registering. Our team will review your application and email you when approved."}
        </Text>
      </div>
    )
  }

  if (step === "email") {
    return (
      <form
        onSubmit={handleSendVerification}
        className="bg-white p-6 border border-ui-border-base rounded-lg flex flex-col gap-y-4"
        data-testid="trade-registration-email-step"
      >
        <Text className="txt-medium-plus text-ui-fg-base">
          Register for a trade account
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          Start by verifying your work email address.
        </Text>

        <label className="flex flex-col gap-y-1 text-sm">
          <span>Work email *</span>
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 px-3 border border-ui-border-base rounded-md"
          />
        </label>

        <ErrorMessage error={error} />

        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          data-testid="send-trade-verification-button"
        >
          Continue
        </Button>
      </form>
    )
  }

  if (step === "verify") {
    return (
      <form
        onSubmit={handleVerifyCode}
        className="bg-white p-6 border border-ui-border-base rounded-lg flex flex-col gap-y-4"
        data-testid="trade-registration-verify-step"
      >
        <Text className="txt-medium-plus text-ui-fg-base">
          Verify your email
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          Enter the code sent to{" "}
          <span className="text-ui-fg-base font-medium">{email}</span>
        </Text>

        <label className="flex flex-col gap-y-1 text-sm">
          <span>Verification code *</span>
          <input
            name="verification_code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            className="h-10 px-3 border border-ui-border-base rounded-md tracking-[0.3em]"
            placeholder="000000"
          />
        </label>

        <ErrorMessage error={error} />

        <div className="flex flex-col gap-y-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            data-testid="verify-trade-email-button"
          >
            Verify email
          </Button>
          <button
            type="button"
            className="text-sm text-ui-fg-interactive hover:underline"
            onClick={() => {
              setStep("email")
              setVerificationCode("")
              setError(null)
            }}
          >
            Use a different email
          </button>
        </div>
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSubmitRegistration}
      className="bg-white p-6 border border-ui-border-base rounded-lg flex flex-col gap-y-4"
      data-testid="trade-registration-form"
    >
      <Text className="txt-medium-plus text-ui-fg-base">
        Company details
      </Text>
      <Text className="text-ui-fg-subtle text-small-regular">
        Email verified: {email}
      </Text>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Company name *</span>
        <input
          name="company_name"
          type="text"
          required
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Contact name *</span>
        <input
          name="contact_name"
          type="text"
          required
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Phone</span>
        <input
          name="phone"
          type="tel"
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>VAT number</span>
        <input
          name="vat_number"
          type="text"
          className="h-10 px-3 border border-ui-border-base rounded-md"
        />
      </label>

      <label className="flex flex-col gap-y-1 text-sm">
        <span>Message</span>
        <textarea
          name="message"
          rows={4}
          className="px-3 py-2 border border-ui-border-base rounded-md"
        />
      </label>

      <ErrorMessage error={error} />

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        data-testid="submit-trade-registration-button"
      >
        Submit registration
      </Button>
    </form>
  )
}

export default TradeRegistrationForm
