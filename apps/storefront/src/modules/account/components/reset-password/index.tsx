"use client"

import { resetPasswordWithToken } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState } from "react"

type Props = {
  token: string
  email: string
}

const ResetPasswordForm = ({ token, email }: Props) => {
  const [message, formAction] = useActionState(resetPasswordWithToken, null)

  if (message?.state === "success") {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="reset-password-success"
      >
        <h1 className="text-large-semi uppercase mb-6">Password updated</h1>
        <p className="text-center text-base-regular text-ui-fg-base mb-8">
          Your password has been saved. Sign in to continue.
        </p>
        <LocalizedClientLink
          href="/account"
          className="underline text-ui-fg-interactive"
        >
          Go to sign in
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-password-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Reset your password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Choose a new password for <strong>{email}</strong>.
      </p>
      <form className="w-full" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="password-input"
          />
          <Input
            label="Confirm password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="confirm-password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="reset-password-error-message"
        />
        <SubmitButton data-testid="set-password-button" className="w-full mt-6">
          Save password
        </SubmitButton>
      </form>
    </div>
  )
}

export default ResetPasswordForm
