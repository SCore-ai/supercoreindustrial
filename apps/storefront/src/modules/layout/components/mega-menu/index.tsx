import { type CatalogNavData } from "@lib/mega-menu/catalog-nav"
import {
  buildMarketingMegaMenus,
  buildSupportMegaMenu,
  type MegaMenuDefinition,
} from "@lib/mega-menu/config"
import type { NavLink, NavMenu } from "@lib/site-navigation"
import MarketingMegaMenu from "./marketing/marketing-mega-menu"
import { MegaMenuProvider } from "./mega-menu-context"
import MegaMenuDropdown from "./mega-menu-dropdown"
import ProductsMegaMenu from "./products/products-mega-menu"

type MegaMenuProps = {
  catalog: CatalogNavData
  mainNavigation?: NavMenu[]
  partnerCatalog?: NavLink[]
}

/**
 * Desktop nav: Products (Medusa) + INS marketing menus + classic Support dropdown.
 * Top-level items open on click only; hover highlights the trigger (INS pattern).
 */
const MegaMenu = ({ catalog, mainNavigation, partnerCatalog }: MegaMenuProps) => {
  const marketingMenus = buildMarketingMegaMenus(mainNavigation)
  const supportMenu = buildSupportMegaMenu(mainNavigation)

  return (
    <MegaMenuProvider>
      <ProductsMegaMenu catalog={catalog} partnerCatalog={partnerCatalog} />
      {marketingMenus.map((menu: MegaMenuDefinition) => (
        <MarketingMegaMenu key={menu.id} menu={menu} />
      ))}
      <MegaMenuDropdown menu={supportMenu} />
    </MegaMenuProvider>
  )
}

export default MegaMenu
