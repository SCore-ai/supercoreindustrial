import { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import {
  fetchB2bAccountSummary,
  type StoreB2bAccountSummary,
} from "@lib/data/b2b-account"
import { getVisibleB2bAccountNav, isB2bAccountEnabled } from "@lib/b2b/account-nav"
import { retrieveCustomer } from "@lib/data/customer"
import TradeOverview from "@modules/account/components/b2b/trade-overview"

export const metadata: Metadata = {
  title: "Trade account",
  description: "B2B trade account overview",
}

const EMPTY_SUMMARY: StoreB2bAccountSummary = {
  company: null,
  member: null,
  counts: {
    quotes: 0,
    conversations: 0,
    pending_approvals: 0,
  },
}

export default async function TradeAccountPage() {
  const customer = await retrieveCustomer().catch(() => null)

  // Parallel @dashboard slot still renders when logged out; layout shows @login.
  // Do not call notFound() here — it would 404 the whole account segment.
  if (!customer) {
    return null
  }

  const [settings, summary] = await Promise.all([
    fetchStoreB2bSettings(),
    fetchB2bAccountSummary(),
  ])

  if (!isB2bAccountEnabled(settings)) {
    notFound()
  }

  const navItems = getVisibleB2bAccountNav(settings)

  return (
    <div>
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">Trade account</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          Quotes, messages, and order approval status for your company.
        </p>
      </div>
      <TradeOverview summary={summary ?? EMPTY_SUMMARY} navItems={navItems} />
    </div>
  )
}
