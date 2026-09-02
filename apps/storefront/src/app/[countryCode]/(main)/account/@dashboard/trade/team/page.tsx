import { Metadata } from "next"
import { retrieveCustomer } from "@lib/data/customer"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { listB2bMembers } from "@lib/data/b2b-account"
import { isB2bAccountEnabled } from "@lib/b2b/account-nav"
import { notFound } from "next/navigation"
import TeamMembers from "@modules/account/components/b2b/team-members"

export const metadata: Metadata = {
  title: "Team",
  description: "Invite subaccounts and manage trade account roles",
}

export default async function TradeTeamPage() {
  const customer = await retrieveCustomer().catch(() => null)

  if (!customer) {
    return null
  }

  const settings = await fetchStoreB2bSettings()

  if (!isB2bAccountEnabled(settings)) {
    notFound()
  }

  const { members, permissions, company } = await listB2bMembers()
  const canManage = permissions.can_manage_members === true

  return (
    <div>
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">Team</h1>
        <p className="text-base-regular text-ui-fg-subtle">
          {company
            ? canManage
              ? `Invite colleagues to ${company.name} and assign buyer, approver, or admin roles.`
              : `People on the ${company.name} trade account.`
            : "Link a trade company to manage subaccounts."}
        </p>
      </div>
      <TeamMembers members={members} canManage={canManage} />
    </div>
  )
}
