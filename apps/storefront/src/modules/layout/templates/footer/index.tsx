import { BRAND } from "@lib/brand"
import { listCategoryTree } from "@lib/data/categories"
import { fetchStoreB2bSettings } from "@lib/data/b2b"
import { applyB2bNavLinks } from "@lib/b2b/nav-links"
import {
  categoryHref,
  getCatalogMenuCategories,
} from "@lib/mega-menu/catalog-nav"
import {
  FOOTER_COMPANY,
  FOOTER_QUICK_LINKS,
} from "@lib/site-navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Logo from "@modules/layout/components/logo"

export default async function Footer() {
  const [categoryTree, b2bSettings] = await Promise.all([
    listCategoryTree().catch(() => []),
    fetchStoreB2bSettings(),
  ])
  const topCategories = getCatalogMenuCategories(categoryTree).slice(0, 8)
  const quickLinks = applyB2bNavLinks(FOOTER_QUICK_LINKS, b2bSettings)

  return (
    <footer className="w-full border-t border-sc-line bg-sc-footer text-white">
      <div className="content-container flex w-full flex-col">
        <div className="flex flex-col gap-y-12 py-12 small:flex-row small:items-start small:justify-between">
          <div className="max-w-sm">
            <Logo tone="light" compact />
            <p className="mt-5 text-base leading-relaxed text-white/75">
              {BRAND.tagline}
            </p>
            <a
              href={`tel:${BRAND.phoneTel}`}
              className="mt-4 inline-block text-base font-semibold text-white hover:underline"
            >
              {BRAND.phone}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 small:grid-cols-3 medium:gap-x-16">
            <div className="flex flex-col gap-y-4">
              <span className="sc-footer-heading">Company</span>
              <ul className="space-y-2.5">
                {FOOTER_COMPANY.map((item) => (
                  <li key={item.href}>
                    <LocalizedClientLink href={item.href} className="sc-footer-link">
                      {item.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-y-4">
              <span className="sc-footer-heading">Quick Links</span>
              <ul className="space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <LocalizedClientLink href={item.href} className="sc-footer-link">
                      {item.label}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 flex flex-col gap-y-4 small:col-span-1">
              <span className="sc-footer-heading">Top Categories</span>
              <ul className="space-y-2.5">
                {topCategories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={categoryHref(category.handle)}
                      className="sc-footer-link"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 border-t border-white/10 py-6 text-white/55 small:flex-row small:items-center small:justify-between">
          <p className="text-base">© {new Date().getFullYear()} {BRAND.legalName}</p>
          <div className="flex flex-wrap items-center gap-5 text-base">
            <LocalizedClientLink href="/sitemap" className="sc-footer-link">
              Sitemap
            </LocalizedClientLink>
            <LocalizedClientLink href="/privacy-policy" className="sc-footer-link">
              Privacy Policy
            </LocalizedClientLink>
            <a
              href="https://www.linkedin.com/company/industrial-networking-solutions"
              target="_blank"
              rel="noopener noreferrer"
              className="sc-footer-link"
            >
              LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@IndustrialNetworkingSolutions"
              target="_blank"
              rel="noopener noreferrer"
              className="sc-footer-link"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
