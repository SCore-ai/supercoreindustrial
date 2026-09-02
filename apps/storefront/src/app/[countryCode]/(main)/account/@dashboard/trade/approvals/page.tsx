import { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { listB2bOrderApprovals } from "@lib/data/b2b-account"
import { retrieveCustomer } from "@lib/data/customer"
import ApprovalList from "@modules/account/components/b2b/approval-list"

export const metadata: Metadata = {
  title: "Order approvals",
  description: "Review and act on subaccount order approvals",
}

export default async function TradeApprovalsPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const settings = await fetchStoreB2bSettings()

  if (settings?.features.order_approval === false) {
    notFound()
  }

  const { approvals, permissions } = await listB2bOrderApprovals()
  const canApprove = permissions?.can_approve_orders === true

  return (
    <div>
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">Order approvals</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          {canApprove
            ? "Approve or reject subaccount orders waiting for company approval."
            : "Track subaccount orders waiting for company approval."}
        </p>
      </div>
      <ApprovalList approvals={approvals} canApprove={canApprove} />
    </div>
  )
}
