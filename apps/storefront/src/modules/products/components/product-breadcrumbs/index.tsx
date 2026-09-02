import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type ProductBreadcrumbsProps = {
  product: HttpTypes.StoreProduct
  categoryLabel?: string
}

const ProductBreadcrumbs = ({
  product,
  categoryLabel,
}: ProductBreadcrumbsProps) => {
  const crumbs: Array<{ label: string; href?: string }> = [
    { label: "Home", href: "/" },
  ]

  if (product.collection?.handle) {
    crumbs.push({
      label: product.collection.title ?? "Collection",
      href: `/collections/${product.collection.handle}`,
    })
  } else if (categoryLabel) {
    crumbs.push({ label: categoryLabel })
  }

  crumbs.push({ label: product.title ?? "Product" })

  return (
    <nav
      aria-label="Breadcrumb"
      className="content-container py-4 text-sm text-sc-steel"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span aria-hidden className="text-sc-line">
                  /
                </span>
              )}
              {crumb.href && !isLast ? (
                <LocalizedClientLink
                  href={crumb.href}
                  className="transition-colors hover:text-sc-cta"
                >
                  {crumb.label}
                </LocalizedClientLink>
              ) : (
                <span
                  className={isLast ? "font-medium text-sc-body truncate max-w-[280px] small:max-w-none" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default ProductBreadcrumbs
