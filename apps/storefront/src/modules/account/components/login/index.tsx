"use client"

import {
  getStoreAuthOptions,
  login,
  startSsoLogin,
  type StoreAuthOptions,
} from "@lib/data/customer"
import MfaChallenge from "@modules/account/components/mfa-challenge"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState, useEffect, useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [loginState, loginAction] = useActionState(login, null)
  const [ssoState, ssoAction] = useActionState(startSsoLogin, null)
  const [authOptions, setAuthOptions] = useState<StoreAuthOptions | null>(null)

  useEffect(() => {
    getStoreAuthOptions().then(setAuthOptions)
  }, [])

  if (loginState?.state === "mfa_required") {
    return <MfaChallenge email={loginState.email} />
  }

  const errorMessage =
    (loginState?.state === "error" ? loginState.error : null) ??
    (ssoState?.state === "error" ? ssoState.error : null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      {loginState?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{loginState.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={loginAction}>
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
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={errorMessage} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      {authOptions?.sso_enabled && (
        <form className="w-full mt-3" action={ssoAction}>
          <SubmitButton
            data-testid="sso-sign-in-button"
            className="w-full"
            variant="secondary"
          >
            Continue with SSO
          </SubmitButton>
        </form>
      )}
      <button
        type="button"
        onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
        className="text-center text-ui-fg-interactive text-small-regular mt-4 underline"
        data-testid="forgot-password-button"
      >
        Forgot password?
      </button>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
