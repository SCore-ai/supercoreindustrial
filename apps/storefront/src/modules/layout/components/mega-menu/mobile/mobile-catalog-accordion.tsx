"use client"

import { useState } from "react"

import {
  categoryHref,
  getCatalogMenuCategories,
  type CatalogNavData,
  type ManufacturerLink,
} from "@lib/mega-menu/catalog-nav"
import {
  PARTNER_PRODUCT_CATEGORIES,
  PRODUCT_BRANDS,
  type NavLink,
} from "@lib/site-navigation"
import { MEGA_MENU_TYPOGRAPHY } from "@lib/mega-menu/schema"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { CatalogViewMode } from "../products/catalog-mode-rail"
import type { ProductNavLink } from "../products/product-links-flat-grid"

type MobileCatalogAccordionProps = {
  catalog: CatalogNavData
  partnerCatalog?: NavLink[]
  onNavigate: () => void
}

const MODE_LABELS: Record<CatalogViewMode, string> = {
  supercore: "Supercore Products",
  partner: "Partner Catalogue",
  brands: "Shop by Brand",
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

const MobileCatalogAccordion = ({
  catalog,
  partnerCatalog,
  onNavigate,
}: MobileCatalogAccordionProps) => {
  const { tree, manufacturers } = catalog
  const categories = getCatalogMenuCategories(tree)
  const [mode, setMode] = useState<CatalogViewMode>("supercore")
  const [expanded, setExpanded] = useState(true)

  const partnerSource =
    partnerCatalog?.length ? partnerCatalog : PARTNER_PRODUCT_CATEGORIES
  const partnerLinks = partnerSource.map((item, index) => ({
    id: `partner-${index}`,
    label: item.label,
    href: item.href,
  }))

  const brandLinks = toBrandLinks(manufacturers)

  const viewAll =
    mode === "supercore"
      ? { href: "/store", label: "View All Supercore Products" }
      : mode === "partner"
        ? { href: "/all-products", label: "View All Partner Products" }
        : { href: "/brands", label: "View All Brands" }

  return (
    <div className="mb-6 border-b border-sc-line pb-6" data-testid="mobile-products-accordion">
      <div className="flex items-center justify-between">
        <LocalizedClientLink
          href="/store"
          onClick={onNavigate}
          className="font-display text-base uppercase tracking-[0.12em] text-sc-ink transition-colors hover:text-sc-cta"
        >
          Products
        </LocalizedClientLink>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="p-2 text-sc-steel"
          aria-label={expanded ? "Collapse products" : "Expand products"}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["supercore", "partner", "brands"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === tab
                    ? "bg-sc-cta/10 text-sc-ink font-medium"
                    : "bg-sc-paper text-sc-steel"
                }`}
              >
                {MODE_LABELS[tab]}
              </button>
            ))}
          </div>

          {mode === "supercore" && (
            <ul className="mt-4 space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={categoryHref(category.handle)}
                    onClick={onNavigate}
                    className={MEGA_MENU_TYPOGRAPHY.flatLink}
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          )}

          {mode === "partner" && (
            <ul className="mt-4 space-y-2">
              {partnerLinks.map((item) => (
                <li key={item.id}>
                  <LocalizedClientLink
                    href={item.href}
                    onClick={onNavigate}
                    className={MEGA_MENU_TYPOGRAPHY.flatLink}
                  >
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          )}

          {mode === "brands" && (
            <>
              <p className="mt-4 text-sm text-sc-steel">
                Spectrum and Zenitel distributor · Axis Solution Partner
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                {brandLinks.map((item) => (
                  <li key={item.id}>
                    <LocalizedClientLink
                      href={item.href}
                      onClick={onNavigate}
                      className={`block truncate ${MEGA_MENU_TYPOGRAPHY.flatLink} ${
                        item.featured ? "font-semibold text-sc-ink" : ""
                      }`}
                    >
                      {item.label}
                      {item.badgeLabel ? (
                        <span className="ml-1 text-[10px] uppercase tracking-wide text-sc-signal">
                          {item.badgeLabel === "Solution Partner"
                            ? "Partner"
                            : "Dist."}
                        </span>
                      ) : null}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </>
          )}

          <LocalizedClientLink
            href={viewAll.href}
            onClick={onNavigate}
            className={`mt-5 inline-block ${MEGA_MENU_TYPOGRAPHY.viewAll}`}
          >
            {viewAll.label}
            <span aria-hidden> →</span>
          </LocalizedClientLink>
        </>
      )}
    </div>
  )
}

export default MobileCatalogAccordion
