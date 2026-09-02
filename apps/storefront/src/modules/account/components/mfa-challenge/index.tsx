"use client"

import { resendMfaCode, verifyMfaLogin } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useState } from "react"

const MfaChallenge = ({ email }: { email: string }) => {
  const [mfaState, mfaAction] = useActionState(verifyMfaLogin, {
    state: "mfa_required" as const,
    email,
  })
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const currentEmail =
    mfaState?.state === "mfa_required" ? mfaState.email : email
  const error =
    mfaState?.state === "mfa_required"
      ? mfaState.error ?? null
      : mfaState?.state === "error"
        ? mfaState.error
        : null

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-mfa-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Verify sign-in</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        We sent a 6-digit code to <strong>{currentEmail}</strong>. Enter it to
        finish signing in.
      </p>
      <form className="w-full" action={mfaAction}>
        <input type="hidden" name="email" value={currentEmail} />
        <Input
          label="Verification code"
          name="code"
          type="text"
          autoComplete="one-time-code"
          required
          data-testid="mfa-code-input"
        />
        <ErrorMessage error={error} data-testid="login-mfa-error" />
        <SubmitButton data-testid="mfa-verify-button" className="w-full mt-6">
          Verify
        </SubmitButton>
      </form>
      <button
        type="button"
        className="text-center text-ui-fg-interactive text-small-regular mt-4 underline"
        onClick={async () => {
          setResendMessage(null)
          const result = await resendMfaCode()
          if (result?.state === "error") {
            setResendMessage(result.error)
            return
          }
          setResendMessage("A new code was sent.")
        }}
      >
        Resend code
      </button>
      {resendMessage && (
        <p className="text-small-regular text-ui-fg-subtle mt-2">
          {resendMessage}
        </p>
      )}
    </div>
  )
}

export default MfaChallenge
