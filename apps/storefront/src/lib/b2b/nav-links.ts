import type { NavLink } from "@lib/site-navigation"
import type { B2bRegistrationMode, StoreB2bSettings } from "@lib/data/b2b"
import { isB2bAccountEnabled } from "@lib/b2b/account-nav"

export const QUICK_ORDER_LINK: NavLink = {
  label: "Quick Order Terminal",
  href: "/quick-order",
}

export const QUOTES_BOM_LINK: NavLink = {
  label: "Request a Bulk Quote (RFQ)",
  href: "/quote",
}

export const QUOTE_CART_LINK: NavLink = {
  label: "Quote cart",
  href: "/quote/cart",
}

export function allowsDedicatedRegistration(mode: B2bRegistrationMode) {
  return mode === "dedicated_form" || mode === "both"
}

export function isBulkOrderEnabled(settings: StoreB2bSettings | null) {
  return (
    settings?.features.quotes !== false &&
    settings?.features.bulk_order_form === true
  )
}

export function buildContactMenuLinks(
  settings: StoreB2bSettings | null
): NavLink[] {
  const links: NavLink[] = [{ label: "Contact Us", href: "/contact-us" }]

  if (isBulkOrderEnabled(settings)) {
    links.push(QUICK_ORDER_LINK)
  }

  if (settings?.features.quotes !== false) {
    links.push({ label: "Request Quote", href: "/get-a-quote" })
    links.push(QUOTES_BOM_LINK)
    links.push(QUOTE_CART_LINK)
  }

  if (settings && allowsDedicatedRegistration(settings.registration.mode)) {
    links.push({
      label: "Register for trade account",
      href: settings.registration.path || "/register-trade",
    })
  }

  if (isB2bAccountEnabled(settings)) {
    links.push({
      label: "B2B account portal",
      href: "/account/trade",
    })
  }

  links.push(
    { label: "Support", href: "/support" },
    { label: "Email Sales", href: "mailto:sales@supercore.local" }
  )

  return links
}

function injectQuickOrderLink(links: NavLink[]) {
  if (links.some((link) => link.href === QUICK_ORDER_LINK.href)) {
    return links
  }

  const contactIndex = links.findIndex((link) => link.href === "/contact-us")
  if (contactIndex >= 0) {
    return [
      ...links.slice(0, contactIndex + 1),
      QUICK_ORDER_LINK,
      ...links.slice(contactIndex + 1),
    ]
  }

  return [QUICK_ORDER_LINK, ...links]
}

export function applyB2bNavLinks(
  links: NavLink[],
  settings: StoreB2bSettings | null
): NavLink[] {
  let result = links

  if (settings?.features.quotes === false) {
    result = result.filter(
      (link) =>
        link.href !== "/quote" &&
        link.href !== "/quote/cart" &&
        link.href !== "/get-a-quote" &&
        link.href !== QUICK_ORDER_LINK.href
    )
  } else {
    if (!result.some((link) => link.href === "/quote")) {
      result = [...result, QUOTES_BOM_LINK]
    }
    if (!result.some((link) => link.href === "/quote/cart")) {
      result = [...result, QUOTE_CART_LINK]
    }
  }

  if (isBulkOrderEnabled(settings)) {
    result = injectQuickOrderLink(result)
  } else {
    result = result.filter((link) => link.href !== QUICK_ORDER_LINK.href)
  }

  return result
}

/** @deprecated Use applyB2bNavLinks */
export function filterQuoteLinks(
  links: NavLink[],
  settings: StoreB2bSettings | null
): NavLink[] {
  return applyB2bNavLinks(links, settings)
}
