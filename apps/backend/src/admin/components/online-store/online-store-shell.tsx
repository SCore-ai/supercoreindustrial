"use client"

import { Container, Heading, Text } from "@medusajs/ui"
import { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import PublishBar from "./publish-bar"

const TABS = [
  { id: "overview", label: "Themes", href: "/online-store" },
  { id: "theme", label: "Theme settings", href: "/online-store/theme" },
  { id: "homepage", label: "Homepage", href: "/online-store/homepage" },
  { id: "navigation", label: "Navigation", href: "/online-store/navigation" },
]

type OnlineStoreShellProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export default function OnlineStoreShell({
  title,
  description,
  actions,
  children,
}: OnlineStoreShellProps) {
  const location = useLocation()

  return (
    <Container className="p-0">
      <div className="border-b border-ui-border-base px-6 py-5">
        <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
          Online Store
        </Text>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Heading level="h1">{title}</Heading>
            {description && (
              <Text size="small" className="mt-1 text-ui-fg-subtle">
                {description}
              </Text>
            )}
          </div>
          {actions}
        </div>
        <nav className="mt-4 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active =
              tab.href === "/online-store"
                ? location.pathname === "/online-store"
                : location.pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.id}
                to={tab.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ui-bg-base shadow-borders-base text-ui-fg-base"
                    : "text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="space-y-4 p-6">
        <PublishBar />
        {children}
      </div>
    </Container>
  )
}
