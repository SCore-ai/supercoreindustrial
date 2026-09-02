import MfaChallenge from "@modules/account/components/mfa-challenge"
import { completeSsoCallback } from "@lib/data/customer"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "SSO sign-in",
  description: "Complete single sign-on",
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SsoCallbackPage({ searchParams }: Props) {
  const params = await searchParams
  const result = await completeSsoCallback(params)

  if (result?.state === "success") {
    redirect("/account")
  }

  if (result?.state === "mfa_required") {
    return (
      <div className="w-full flex justify-start px-8 py-8">
        <MfaChallenge email={result.email} />
      </div>
    )
  }

  return (
    <div className="w-full flex justify-start px-8 py-8">
      <div className="max-w-sm w-full flex flex-col items-center">
        <h1 className="text-large-semi uppercase mb-6">SSO sign-in</h1>
        <p className="text-center text-base-regular text-ui-fg-base">
          {result?.state === "error"
            ? result.error
            : "SSO did not complete. Return to sign in and try again."}
        </p>
      </div>
    </div>
  )
}
