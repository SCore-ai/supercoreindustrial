"use client"

import { Fragment } from "react"

import { MEGA_MENU_LAYOUT } from "@lib/mega-menu/schema"
import { type NavLink } from "@lib/site-navigation"
import { useHoverIntent } from "@lib/hooks/use-hover-intent"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MegaMenuChevron from "@modules/layout/components/mega-menu/mega-menu-chevron"

const ContactNavButton = ({
  contactMenuLinks,
}: {
  contactMenuLinks: NavLink[]
}) => {
  const { active, close, onEnter, onLeave } = useHoverIntent({
    openDelay: MEGA_MENU_LAYOUT.openDelayMs,
    closeDelay: MEGA_MENU_LAYOUT.closeDelayMs,
  })

  return (
    <div
      className="relative hidden min-[1024px]:block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <LocalizedClientLink
        href="/contact-us"
        className="inline-flex items-center gap-1.5 rounded-md bg-sc-cta px-5 py-2.5 text-base font-semibold text-sc-body transition-colors hover:bg-sc-cta-hover"
        aria-expanded={active}
        data-testid="nav-contact-button"
      >
        Contact
        <MegaMenuChevron active={active} />
      </LocalizedClientLink>
      {active && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[220px] rounded-md border border-sc-line bg-white py-2 shadow-lg">
          {contactMenuLinks.map((item) => (
            <Fragment key={item.href}>
              {item.href.startsWith("mailto:") ? (
                <a
                  href={item.href}
                  className="block px-4 py-2.5 text-base text-sc-steel hover:bg-sc-paper hover:text-sc-ink"
                >
                  {item.label}
                </a>
              ) : (
                <LocalizedClientLink
                  href={item.href}
                  onClick={close}
                  className="block px-4 py-2.5 text-base text-sc-steel hover:bg-sc-paper hover:text-sc-ink"
                >
                  {item.label}
                </LocalizedClientLink>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContactNavButton
