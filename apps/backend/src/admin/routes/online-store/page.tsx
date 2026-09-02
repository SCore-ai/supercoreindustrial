"use client"

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront } from "@medusajs/icons"
import { Badge, Button, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import OnlineStoreShell from "../../components/online-store/online-store-shell"
import ThemePreviewFrame from "../../components/online-store/theme-preview-frame"
import { onlineStoreClient } from "../../lib/online-store-client"

const OnlineStoreIndexPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-online-store-overview"],
    queryFn: () => onlineStoreClient.getOverview(),
  })

  const theme = data?.theme
  const storefrontUrl = theme?.storefront_url ?? "http://localhost:8000"

  return (
    <OnlineStoreShell
      title="Online Store"
      description="Customize your storefront theme, homepage sections, mega menu navigation, and announcement bar."
      actions={
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-fg txt-compact-small-plus rounded-md border border-ui-border-base bg-ui-button-neutral px-3 py-1.5 shadow-buttons-neutral"
        >
          View live store
        </a>
      }
    >
      <div className="rounded-xl border border-ui-border-base bg-ui-bg-base p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Text weight="plus" className="text-lg">
                {isLoading ? "Loading…" : theme?.name ?? "Supercore Industrial"}
              </Text>
              <Badge color="green" size="2xsmall">
                Active
              </Badge>
              {data?.has_unpublished_changes && (
                <Badge color="orange" size="2xsmall">
                  Draft changes
                </Badge>
              )}
            </div>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              Version {theme?.version ?? "1.0.0"}
              {data?.published_at
                ? ` · Last published ${new Date(data.published_at).toLocaleString()}`
                : theme?.updated_at
                  ? ` · Last saved ${new Date(theme.updated_at).toLocaleString()}`
                  : ""}
            </Text>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link to="/online-store/homepage">Edit homepage</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/online-store/navigation">Edit navigation</Link>
            </Button>
            <Button asChild>
              <Link to="/online-store/theme">Edit theme</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <ThemePreviewFrame height={560} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          {
            title: "Theme settings",
            description: "Colors, typography, layout, announcement bar, custom CSS.",
            href: "/online-store/theme",
          },
          {
            title: "Homepage",
            description: "Hero carousel slides and featured category tiles.",
            href: "/online-store/homepage",
          },
          {
            title: "Mega menu navigation",
            description: "Edit Services, Technologies, Company, Support columns and links.",
            href: "/online-store/navigation",
          },
          {
            title: "Medusa products",
            description: "Products mega menu categories come from your catalog.",
            href: "/products",
          },
        ].map((card) => (
          <Link
            key={card.href}
            to={card.href}
            className="rounded-lg border border-ui-border-base bg-ui-bg-base p-4 transition hover:border-ui-border-strong hover:bg-ui-bg-subtle"
          >
            <Text weight="plus">{card.title}</Text>
            <Text size="small" className="mt-1 text-ui-fg-subtle">
              {card.description}
            </Text>
          </Link>
        ))}
      </div>
    </OnlineStoreShell>
  )
}

export const config = defineRouteConfig({
  label: "Online Store",
  icon: BuildingStorefront,
})

export default OnlineStoreIndexPage
