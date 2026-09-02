import { listCategoryTree } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { retrieveCart } from "@lib/data/cart"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { fetchPopularSearches } from "@lib/data/search"
import { fetchOnlineStoreSettings } from "@lib/data/online-store"
import { buildContactMenuLinks, applyB2bNavLinks, isBulkOrderEnabled } from "@lib/b2b/nav-links"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { buildCatalogNav } from "@lib/mega-menu/catalog-nav"
import { type NavMenu } from "@lib/site-navigation"
import { StoreRegion } from "@medusajs/types"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import NavBarClient from "@modules/layout/components/nav-bar-client"

export default async function Nav() {
  const [
    regionsResult,
    localesResult,
    currentLocaleResult,
    categoryTreeResult,
    collectionsResult,
    cartResult,
    b2bSettingsResult,
    onlineStoreResult,
    popularSearchesResult,
  ] = await Promise.allSettled([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategoryTree(),
    listCollections().then((res) => res.collections),
    retrieveCart(),
    fetchStoreB2bSettings(),
    fetchOnlineStoreSettings(),
    fetchPopularSearches(),
  ])

  const regions =
    regionsResult.status === "fulfilled" ? regionsResult.value : []
  const locales =
    localesResult.status === "fulfilled" ? localesResult.value : null
  const currentLocale =
    currentLocaleResult.status === "fulfilled"
      ? currentLocaleResult.value
      : null

  const catalog = buildCatalogNav(
    categoryTreeResult.status === "fulfilled" ? categoryTreeResult.value : [],
    collectionsResult.status === "fulfilled" ? collectionsResult.value : []
  )
  const cart = cartResult.status === "fulfilled" ? cartResult.value : null
  const b2bSettings =
    b2bSettingsResult.status === "fulfilled" ? b2bSettingsResult.value : null
  const onlineStorePayload =
    onlineStoreResult.status === "fulfilled" ? onlineStoreResult.value : null
  const onlineStore = onlineStorePayload?.settings ?? null
  const popularSearches =
    popularSearchesResult.status === "fulfilled"
      ? popularSearchesResult.value.popular.map((entry) => entry.query)
      : []

  const mainNavigation: NavMenu[] | undefined =
    onlineStore?.navigation.main_navigation
  const partnerCatalog = onlineStore?.navigation.partner_catalog
  const contactMenuLinks = applyB2bNavLinks(
    onlineStore?.navigation.contact_menu?.length
      ? onlineStore.navigation.contact_menu
      : buildContactMenuLinks(b2bSettings),
    b2bSettings
  )
  const quotesEnabled = b2bSettings?.features.quotes !== false
  const bulkOrderEnabled = isBulkOrderEnabled(b2bSettings)
  const announcement = onlineStore?.theme.announcement

  return (
    <div className="sticky top-0 inset-x-0 z-50" data-site-header>
      <AnnouncementBar
        enabled={announcement?.enabled}
        message={announcement?.message}
        linkLabel={announcement?.linkLabel}
        linkHref={announcement?.linkHref}
        dismissible={announcement?.dismissible}
      />
      <header className="relative border-b border-sc-line bg-white">
        <NavBarClient
          catalog={catalog}
          mainNavigation={mainNavigation}
          partnerCatalog={partnerCatalog}
          popularSearches={popularSearches}
          regions={regions}
          locales={locales}
          currentLocale={currentLocale}
          cart={cart}
          contactMenuLinks={contactMenuLinks}
          quotesEnabled={quotesEnabled}
          bulkOrderEnabled={bulkOrderEnabled}
        />
      </header>
    </div>
  )
}
