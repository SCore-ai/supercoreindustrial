import { retrieveCustomer } from "@lib/data/customer"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import {
  getVisibleB2bAccountNav,
  isB2bAccountEnabled,
} from "@lib/b2b/account-nav"
import AccountLayout from "@modules/account/templates/account-layout"
import LoginTemplate from "@modules/account/templates/login-template"

export default async function AccountPageLayout({
  dashboard,
  login,
  children,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
  children?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)
  const settings = await fetchStoreB2bSettings()
  const showB2bAccount = isB2bAccountEnabled(settings)
  const b2bNavItems = showB2bAccount
    ? getVisibleB2bAccountNav(settings)
    : []

  // Unauthenticated: prefer @login (covers reset-password) with a hard
  // LoginTemplate fallback. Dashboard pages must return null — not notFound() —
  // when logged out, or the parallel slot error wipes this content.
  if (!customer) {
    return (
      <AccountLayout customer={null} b2bNavItems={[]} showB2bAccount={false}>
        {login ?? <LoginTemplate />}
      </AccountLayout>
    )
  }

  return (
    <AccountLayout
      customer={customer}
      b2bNavItems={b2bNavItems}
      showB2bAccount={showB2bAccount}
    >
      {dashboard ?? children}
    </AccountLayout>
  )
}
