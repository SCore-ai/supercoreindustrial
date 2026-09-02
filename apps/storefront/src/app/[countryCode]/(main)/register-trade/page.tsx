import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { allowsDedicatedRegistration } from "@lib/b2b/nav-links"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import TradeRegistrationForm from "@modules/b2b/components/trade-registration-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register for trade account",
  description: "Apply for a Supercore Industrial trade account",
}

export default async function RegisterTradePage() {
  const settings = await fetchStoreB2bSettings()
  const dedicatedAllowed =
    settings && allowsDedicatedRegistration(settings.registration.mode)

  return (
    <div className="content-container py-12" data-testid="register-trade-page">
      <div className="max-w-xl mx-auto flex flex-col gap-y-8">
        <div>
          <h1 className="text-2xl-semi text-ui-fg-base">
            Register for a trade account
          </h1>
          <p className="text-ui-fg-subtle text-small-regular mt-2">
            Apply for B2B pricing, quote management, and order approval features.
          </p>
        </div>

        {!dedicatedAllowed ? (
          <div className="bg-white p-6 border border-ui-border-base rounded-lg">
            <p className="text-ui-fg-base text-base-regular">
              Trade account registration via this form is currently unavailable.
            </p>
            {settings?.features.quotes !== false ? (
              <p className="text-ui-fg-subtle text-small-regular mt-3">
                You can request a trade account by{" "}
                <LocalizedClientLink
                  href="/quote"
                  className="text-ui-fg-interactive underline"
                >
                  submitting a quote request
                </LocalizedClientLink>{" "}
                instead.
              </p>
            ) : (
              <p className="text-ui-fg-subtle text-small-regular mt-3">
                Please{" "}
                <LocalizedClientLink
                  href="/contact-us"
                  className="text-ui-fg-interactive underline"
                >
                  contact us
                </LocalizedClientLink>{" "}
                for assistance.
              </p>
            )}
          </div>
        ) : (
          <TradeRegistrationForm
            autoApprove={settings?.registration.auto_approve ?? false}
          />
        )}
      </div>
    </div>
  )
}
