import type { StoreB2bSettings } from "@lib/data/b2b"

export type B2bAccountNavItem = {
  href: string
  label: string
  feature?: keyof StoreB2bSettings["features"]
}

export const B2B_ACCOUNT_NAV: B2bAccountNavItem[] = [
  { href: "/account/trade", label: "Trade overview" },
  { href: "/account/trade/quotes", label: "My quotes", feature: "quotes" },
  {
    href: "/account/trade/messages",
    label: "Messages",
    feature: "conversations",
  },
  {
    href: "/account/trade/approvals",
    label: "Order approvals",
    feature: "order_approval",
  },
  { href: "/account/trade/team", label: "Team" },
]

export function getVisibleB2bAccountNav(
  settings: StoreB2bSettings | null
): B2bAccountNavItem[] {
  return B2B_ACCOUNT_NAV.filter((item) => {
    if (!item.feature) {
      return true
    }

    return settings?.features[item.feature] !== false
  })
}

export function isB2bAccountEnabled(settings: StoreB2bSettings | null) {
  if (!settings) {
    return true
  }

  return (
    settings.features.quotes !== false ||
    settings.features.conversations !== false ||
    settings.features.order_approval !== false
  )
}
