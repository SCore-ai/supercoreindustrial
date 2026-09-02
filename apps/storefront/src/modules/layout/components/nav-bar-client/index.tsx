"use client"

import { Suspense, useCallback, useState } from "react"

import { type CatalogNavData } from "@lib/mega-menu/catalog-nav"
import { Locale } from "@lib/data/locales"
import { type NavLink, type NavMenu } from "@lib/site-navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartDropdown from "@modules/layout/components/cart-dropdown"
import ContactNavButton from "@modules/layout/components/contact-nav-button"
import HeaderQuickLinks from "@modules/layout/components/header-quick-links"
import CountrySelect from "@modules/layout/components/country-select"
import Logo from "@modules/layout/components/logo"
import MegaMenu from "@modules/layout/components/mega-menu"
import SearchBar from "@modules/layout/components/search-bar"
import SideMenu from "@modules/layout/components/side-menu"

type NavBarClientProps = {
  catalog: CatalogNavData
  mainNavigation?: NavMenu[]
  partnerCatalog?: NavLink[]
  popularSearches?: string[]
  regions: HttpTypes.StoreRegion[]
  locales: Locale[] | null
  currentLocale: string | null
  cart: HttpTypes.StoreCart | null
  contactMenuLinks: NavLink[]
  quotesEnabled: boolean
  bulkOrderEnabled: boolean
}

const NavBarClient = ({
  catalog,
  mainNavigation,
  partnerCatalog,
  popularSearches = [],
  regions,
  locales,
  currentLocale,
  cart,
  contactMenuLinks,
  quotesEnabled,
  bulkOrderEnabled,
}: NavBarClientProps) => {
  const [searchExpanded, setSearchExpanded] = useState(false)

  const expandSearch = useCallback(() => {
    setSearchExpanded(true)
  }, [])

  const collapseSearch = useCallback(() => {
    setSearchExpanded(false)
  }, [])

  return (
    <nav className="content-container flex h-[var(--sc-header-height)] items-stretch">
      <div className="flex min-w-0 flex-1 items-stretch justify-start gap-x-4 lg:gap-x-6">
        <div className="flex shrink-0 items-center min-[1024px]:hidden">
          <SideMenu
            regions={regions}
            locales={locales}
            currentLocale={currentLocale}
            catalog={catalog}
            mainNavigation={mainNavigation}
            partnerCatalog={partnerCatalog}
            contactMenuLinks={contactMenuLinks}
            quotesEnabled={quotesEnabled}
            bulkOrderEnabled={bulkOrderEnabled}
          />
        </div>

        {/* Desktop: logo + nav curtain closes left while search bar fills over ~1s (INS-style) */}
        <div
          className={`sc-header-main-grid hidden min-[1024px]:grid ${
            searchExpanded ? "is-search-expanded" : ""
          }`}
        >
          <div
            className="sc-header-brand-nav"
            aria-hidden={searchExpanded}
          >
            <div className="flex h-full w-max max-w-none items-stretch">
              <div className="flex shrink-0 items-center pr-4 lg:pr-6">
                <Logo />
              </div>
              <MegaMenu
                catalog={catalog}
                mainNavigation={mainNavigation}
                partnerCatalog={partnerCatalog}
              />
            </div>
          </div>

          <div className="sc-header-search-cell">
            <Suspense fallback={<div className="h-10 w-full" />}>
              <SearchBar
                expanded={searchExpanded}
                onExpand={expandSearch}
                onClose={collapseSearch}
                popularSearches={popularSearches}
              />
            </Suspense>
          </div>
        </div>

        {/* Mobile: compact search only */}
        <div className="flex min-w-0 flex-1 items-center min-[1024px]:hidden">
          <Suspense fallback={<div className="h-10 w-full" />}>
            <SearchBar popularSearches={popularSearches} />
          </Suspense>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-4">
        {regions.length > 0 && (
          <div className="hidden min-[1024px]:block">
            <CountrySelect regions={regions} variant="header" />
          </div>
        )}
        <ContactNavButton contactMenuLinks={contactMenuLinks} />
        <HeaderQuickLinks
          quickOrderEnabled={bulkOrderEnabled}
          quotesEnabled={quotesEnabled}
        />
        <LocalizedClientLink
          href="/account"
          className="hidden min-[1024px]:inline-flex p-2.5 text-sc-body hover:text-sc-ink"
          data-testid="nav-account-link"
          aria-label="Account"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M5 20a7 7 0 0114 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </LocalizedClientLink>
        <CartDropdown cart={cart} />
      </div>
    </nav>
  )
}

export default NavBarClient
