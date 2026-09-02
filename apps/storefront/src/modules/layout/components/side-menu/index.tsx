"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { BRAND } from "@lib/brand"
import { type CatalogNavData } from "@lib/mega-menu/catalog-nav"
import { MAIN_NAV, type NavLink, type NavMenu } from "@lib/site-navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import MobileCatalogAccordion from "@modules/layout/components/mega-menu/mobile/mobile-catalog-accordion"
import MobileNavAccordion from "@modules/layout/components/mega-menu/mobile/mobile-nav-accordion"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  catalog: CatalogNavData
  mainNavigation?: NavMenu[]
  partnerCatalog?: NavLink[]
  contactMenuLinks: NavLink[]
  quotesEnabled: boolean
  bulkOrderEnabled: boolean
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  catalog,
  mainNavigation,
  partnerCatalog,
  contactMenuLinks,
  quotesEnabled,
  bulkOrderEnabled,
}: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center text-sm font-medium text-sc-steel transition-all ease-out duration-200 focus:outline-none hover:text-sc-ink"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/40 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 -translate-x-4"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-4"
              >
                <PopoverPanel className="fixed left-0 top-0 z-[51] flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-sc-line px-6 py-4">
                    <span className="font-display text-lg uppercase tracking-[0.12em] text-sc-ink">
                      Menu
                    </span>
                    <button data-testid="close-menu-button" onClick={close} aria-label="Close menu">
                      <XMark />
                    </button>
                  </div>

                  <div className="flex-1 px-6 py-6">
                    <LocalizedClientLink
                      href="/"
                      onClick={close}
                      className="mb-6 block text-lg font-semibold text-sc-ink"
                    >
                      Home
                    </LocalizedClientLink>

                    <MobileCatalogAccordion
                      catalog={catalog}
                      partnerCatalog={partnerCatalog}
                      onNavigate={close}
                    />

                    {(mainNavigation ?? MAIN_NAV).map((menu) =>
                      menu.columns?.map((column) => (
                        <MobileNavAccordion
                          key={`${menu.label}-${column.title}`}
                          title={column.title}
                          href={column.href}
                          items={column.items}
                          onNavigate={close}
                        />
                      ))
                    )}

                    <MobileNavAccordion
                      title="Contact"
                      href="/contact-us"
                      items={contactMenuLinks.filter(
                        (i) => !i.href.startsWith("mailto:")
                      )}
                      onNavigate={close}
                    />

                    <LocalizedClientLink
                      href="/contact-us"
                      onClick={close}
                      className="mb-6 inline-flex w-full items-center justify-center rounded-md bg-sc-cta px-4 py-3 text-base font-semibold text-sc-body hover:bg-sc-cta-hover"
                    >
                      Contact
                    </LocalizedClientLink>

                    <div className="space-y-3 border-t border-sc-line pt-6">
                      <LocalizedClientLink href="/cart" onClick={close} className="block text-sm">
                        Cart
                      </LocalizedClientLink>
                      {quotesEnabled && (
                        <LocalizedClientLink
                          href="/quote"
                          onClick={close}
                          className="block text-sm"
                        >
                          Quotes / BOM
                        </LocalizedClientLink>
                      )}
                      {bulkOrderEnabled && (
                        <LocalizedClientLink
                          href="/quick-order"
                          onClick={close}
                          className="block text-sm"
                        >
                          Quick Order
                        </LocalizedClientLink>
                      )}
                      {quotesEnabled && (
                        <LocalizedClientLink
                          href="/quote/cart"
                          onClick={close}
                          className="block text-sm"
                        >
                          Quote cart
                        </LocalizedClientLink>
                      )}
                      <LocalizedClientLink href="/account" onClick={close} className="block text-sm">
                        Account
                      </LocalizedClientLink>
                    </div>
                  </div>

                  <div className="border-t border-sc-line px-6 py-6">
                    <div className="flex flex-col gap-y-6">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                            variant="footer"
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="txt-compact-small text-sc-steel">
                        © {new Date().getFullYear()} {BRAND.legalName}
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
