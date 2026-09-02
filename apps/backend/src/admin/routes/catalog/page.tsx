import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Buildings,
  CurrencyDollar,
  MagnifyingGlass,
  Shopping,
} from "@medusajs/icons"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const cards = [
  {
    title: "Currencies & FX",
    description:
      "Manage GBP-base exchange rates and convert EUR / USD price lists.",
    href: "/catalog/currencies",
    icon: CurrencyDollar,
    badge: "GBP base",
  },
  {
    title: "Manufacturer imports",
    description:
      "Preview and import manufacturer price lists (Zenitel, Axis, Spectrum, Tecnovideo, Cisco).",
    href: "/catalog/imports",
    icon: Buildings,
    badge: "5 brands",
  },
  {
    title: "Search analytics",
    description:
      "Popular and recent storefront search queries from Typesense-backed search.",
    href: "/catalog/search-analytics",
    icon: MagnifyingGlass,
    badge: "Live",
  },
  {
    title: "Medusa products",
    description:
      "Open the native product catalog for inventory, variants, and media.",
    href: "/products",
    icon: Shopping,
    badge: "Core",
  },
]

const CatalogIndexPage = () => (
  <Container className="p-0">
    <div className="border-b border-ui-border-base px-6 py-5">
      <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
        Supercore Industrial
      </Text>
      <Heading level="h1" className="mt-1">
        Catalog
      </Heading>
      <Text size="small" className="mt-1 text-ui-fg-subtle">
        Product imports, FX conversion, and inventory operations in one place.
      </Text>
    </div>

    <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link
            key={card.href}
            to={card.href}
            className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4 transition hover:border-ui-border-strong hover:bg-ui-bg-subtle"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-ui-bg-subtle">
                <Icon />
              </div>
              <Badge size="2xsmall" color="grey">
                {card.badge}
              </Badge>
            </div>
            <Text weight="plus" className="mt-3">
              {card.title}
            </Text>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              {card.description}
            </Text>
          </Link>
        )
      })}
    </div>
  </Container>
)

export const config = defineRouteConfig({
  label: "Catalog",
  icon: Shopping,
})

export default CatalogIndexPage
