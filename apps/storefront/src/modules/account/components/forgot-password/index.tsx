"use client"

import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(requestPasswordReset, null)

  if (message?.state === "success") {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="forgot-password-success"
      >
        <h1 className="text-large-semi uppercase mb-6">Check your email</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          If an account exists for <strong>{message.email}</strong>, we sent a
          password reset link. It expires shortly.
        </p>
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
          data-testid="back-to-sign-in-button"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email and we will send a link to set a new password.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="forgot-password-error-message"
        />
        <SubmitButton
          data-testid="send-reset-link-button"
          className="w-full mt-6"
        >
          Send reset link
        </SubmitButton>
      </form>
      <button
        onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        className="text-center text-ui-fg-base text-small-regular mt-6 underline"
        data-testid="back-to-sign-in-button"
      >
        Back to sign in
      </button>
    </div>
  )
}

export default ForgotPassword
