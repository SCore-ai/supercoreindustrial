"use client"

import { useState } from "react"

import {
  getCatalogMenuCategories,
  type CatalogNavData,
  type ManufacturerLink,
} from "@lib/mega-menu/catalog-nav"
import {
  PARTNER_PRODUCT_CATEGORIES,
  PRODUCT_BRANDS,
  type NavLink,
} from "@lib/site-navigation"
import { MEGA_MENU_LAYOUT, MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CatalogModeRail, {
  type CatalogViewMode,
} from "./catalog-mode-rail"
import CategoryFlatGrid from "./category-flat-grid"
import ProductLinksFlatGrid, {
  type ProductNavLink,
} from "./product-links-flat-grid"
import MegaMenuContentPane from "../mega-menu-content-pane"
import { useMegaMenu } from "../mega-menu-context"
import MegaMenuPanelShell from "../mega-menu-panel-shell"
import MegaMenuTrigger from "../mega-menu-trigger"

type ProductsMegaMenuProps = {
  catalog: CatalogNavData
  partnerCatalog?: NavLink[]
}

function toPartnerLinks(partnerCatalog?: NavLink[]): ProductNavLink[] {
  const source =
    partnerCatalog?.length ? partnerCatalog : PARTNER_PRODUCT_CATEGORIES

  return source.map((item, index) => ({
    id: `partner-${index}`,
    label: item.label,
    href: item.href,
  }))
}

function toBrandLinks(manufacturers: ManufacturerLink[]): ProductNavLink[] {
  if (manufacturers.length > 0) {
    return manufacturers.map((brand) => ({
      id: brand.id,
      label: brand.title,
      href: brand.href,
      featured: brand.featured,
      badgeLabel: brand.badgeLabel,
    }))
  }

  return PRODUCT_BRANDS.filter((item) => item.href !== "/brands").map(
    (item, index) => ({
      id: `brand-${index}`,
      label: item.label,
      href: item.href,
      featured: item.href === "/brands/spectrum",
      badgeLabel:
        item.href === "/brands/spectrum" || item.href === "/brands/zenitel"
          ? "Distributor"
          : item.href === "/brands/axis"
            ? "Solution Partner"
            : undefined,
    })
  )
}

const MENU_ID = "products"

const ProductsMegaMenu = ({ catalog, partnerCatalog }: ProductsMegaMenuProps) => {
  const { tree, manufacturers } = catalog
  const categories = getCatalogMenuCategories(tree)
  const partnerLinks = toPartnerLinks(partnerCatalog)
  const brandLinks = toBrandLinks(manufacturers)

  const { close, isOpen } = useMegaMenu()
  const active = isOpen(MENU_ID)

  const [mode, setMode] = useState<CatalogViewMode>("supercore")

  if (
    categories.length === 0 &&
    partnerLinks.length === 0 &&
    brandLinks.length === 0
  ) {
    return (
      <LocalizedClientLink
        href="/store"
        className={`${MEGA_MENU_TYPOGRAPHY.trigger}`}
      >
        Products
      </LocalizedClientLink>
    )
  }

  return (
    <div className="relative h-full">
      <MegaMenuTrigger
        id={MENU_ID}
        label="Products"
        testId="product-mega-menu-trigger"
      />

      <MegaMenuPanelShell
        open={active}
        label="Products menu"
        testId="product-mega-menu-panel"
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: MEGA_MENU_LAYOUT.productsGrid,
            minHeight: `${MEGA_MENU_LAYOUT.panelMinHeight}px`,
            maxHeight: `${MEGA_MENU_LAYOUT.panelMaxHeight}px`,
          }}
        >
          <CatalogModeRail mode={mode} onModeChange={setMode} />

          <MegaMenuContentPane paneKey={mode}>
            {mode === "supercore" && (
              <CategoryFlatGrid categories={categories} onClose={close} />
            )}

            {mode === "partner" && (
              <ProductLinksFlatGrid
                title="Partner Catalogue"
                items={partnerLinks}
                viewAllHref="/all-products"
                viewAllLabel="View All Partner Products"
                onClose={close}
                testId="mega-menu-partner-flat-grid"
                linkTestId="mega-menu-partner-link"
              />
            )}

            {mode === "brands" && (
              <ProductLinksFlatGrid
                title="Shop by Brand"
                subtitle="Spectrum and Zenitel distributor desks · Axis Solution Partner"
                items={brandLinks}
                viewAllHref="/brands"
                viewAllLabel="View All Brands"
                onClose={close}
                testId="mega-menu-brand-flat-grid"
                linkTestId="mega-menu-brand-link"
              />
            )}
          </MegaMenuContentPane>
        </div>
      </MegaMenuPanelShell>
    </div>
  )
}

export default ProductsMegaMenu
