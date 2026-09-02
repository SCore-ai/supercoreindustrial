import ResetPasswordForm from "@modules/account/components/reset-password"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Set your password",
  description: "Set your trade account password",
}

type Props = {
  searchParams: Promise<{
    token?: string
    email?: string
  }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const params = await searchParams
  const token = params.token?.trim() ?? ""
  const email = params.email?.trim() ?? ""

  if (!token || !email) {
    return (
      <div className="w-full flex justify-start px-8 py-8">
        <div className="max-w-sm w-full flex flex-col items-center">
          <h1 className="text-large-semi uppercase mb-6">Invalid link</h1>
          <p className="text-center text-base-regular text-ui-fg-base">
            This password reset link is missing required information. Request a
            new link from the sign-in page or contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex justify-start px-8 py-8">
      <ResetPasswordForm token={token} email={email} />
    </div>
  )
}
