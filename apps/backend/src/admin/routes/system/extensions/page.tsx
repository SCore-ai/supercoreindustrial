import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, Puzzle } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { systemExtensionsClient } from "../../../lib/system-extensions-client"
import type {
  ExtensionCatalogItem,
  ExtensionKind,
  ExtensionStatus,
  RuntimeVersions,
} from "../../../lib/system-extensions-types"

type FilterKind = "all" | ExtensionKind

const KIND_LABELS: Record<ExtensionKind, string> = {
  plugin: "Plugin",
  module: "Module",
  app: "App",
  provider: "Provider",
}

const RUNTIME_ITEMS: {
  label: string
  key: keyof RuntimeVersions | "host"
}[] = [
  { label: "Node.js", key: "node" },
  { label: "pnpm", key: "pnpm" },
  { label: "ESLint", key: "eslint" },
  { label: "TypeScript", key: "typescript" },
  { label: "Turbo", key: "turbo" },
  { label: "Medusa", key: "medusa" },
  { label: "Framework API", key: "framework" },
  { label: "Admin SDK", key: "admin_sdk" },
  { label: "Dashboard", key: "dashboard" },
  { label: "Next.js", key: "storefront_next" },
  { label: "React", key: "storefront_react" },
  { label: "Host", key: "host" },
]

async function copyText(value: string, label = "Copied") {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(label)
  } catch {
    toast.error("Could not copy")
  }
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

const StatusBadge = ({ status }: { status: ExtensionStatus }) => {
  const map = {
    active: { color: "green" as const, label: "Active" },
    inactive: { color: "grey" as const, label: "Inactive" },
    installed: { color: "orange" as const, label: "Installed" },
  }
  const item = map[status]

  return (
    <Badge color={item.color} size="2xsmall">
      {item.label}
    </Badge>
  )
}

const Section = ({
  title,
  meta,
  children,
}: {
  title: string
  meta?: React.ReactNode
  children: React.ReactNode
}) => (
  <section className="px-6 py-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <Text weight="plus">{title}</Text>
      {meta}
    </div>
    {children}
  </section>
)

const RuntimeStrip = ({ runtime }: { runtime: RuntimeVersions }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
    {RUNTIME_ITEMS.map((item) => {
      const value =
        item.key === "host"
          ? `${runtime.platform}/${runtime.arch}`
          : runtime[item.key]

      return (
        <div
          key={item.label}
          className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-3 py-2"
        >
          <Text size="xsmall" className="text-ui-fg-muted">
            {item.label}
          </Text>
          <Text size="small" weight="plus" className="mt-0.5 truncate font-mono">
            {value ?? "—"}
          </Text>
        </div>
      )
    })}
  </div>
)

const VersionCell = ({ extension }: { extension: ExtensionCatalogItem }) => (
  <div className="flex min-w-[168px] flex-col gap-1">
    <Text size="small" weight="plus" className="font-mono">
      {extension.version_label
        ? `${extension.version_label} ${extension.version ?? "—"}`
        : (extension.version ?? "—")}
    </Text>
    {extension.app_version && (
      <Text size="xsmall" className="text-ui-fg-subtle">
        App {extension.app_version}
      </Text>
    )}
    {extension.latest_version && (
      <Text
        size="xsmall"
        className={
          extension.update_available
            ? "text-ui-fg-interactive"
            : "text-ui-fg-muted"
        }
      >
        Latest {extension.latest_version}
        {extension.update_available ? " · update" : ""}
      </Text>
    )}
    {!!extension.related_packages?.length && (
      <div className="mt-1 space-y-0.5 border-t border-ui-border-base pt-1">
        {extension.related_packages.map((pkg) => (
          <Text
            key={pkg.package_name}
            size="xsmall"
            className="text-ui-fg-subtle"
          >
            {pkg.label}{" "}
            <span className="font-mono">{pkg.version ?? "—"}</span>
            {pkg.update_available && pkg.latest_version
              ? ` → ${pkg.latest_version}`
              : ""}
          </Text>
        ))}
      </div>
    )}
  </div>
)

const PackageCell = ({ extension }: { extension: ExtensionCatalogItem }) => (
  <div className="flex min-w-[200px] flex-col gap-1">
    <Text size="xsmall" className="break-all font-mono text-ui-fg-base">
      {extension.package_name ?? "—"}
    </Text>
    {extension.resolve && extension.resolve !== extension.package_name && (
      <Text size="xsmall" className="break-all font-mono text-ui-fg-subtle">
        {extension.resolve}
      </Text>
    )}
    {extension.tracked_package &&
      extension.tracked_package !== extension.package_name && (
        <Text size="xsmall" className="text-ui-fg-muted">
          Tracks{" "}
          <span className="font-mono">{extension.tracked_package}</span>
        </Text>
      )}
  </div>
)

const ActionButton = ({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) => (
  <Button
    type="button"
    size="small"
    variant="secondary"
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </Button>
)

const RowActions = ({
  extension,
  onToggle,
  isPending,
}: {
  extension: ExtensionCatalogItem
  onToggle: (id: string, enabled: boolean) => void
  isPending: boolean
}) => {
  const canActivate =
    extension.configurable &&
    (extension.status === "inactive" || extension.status === "installed")
  const canDeactivate =
    extension.configurable && extension.status === "active"
  const npmPackage = extension.tracked_package ?? extension.package_name
  const copyTarget = npmPackage ?? extension.resolve ?? null

  return (
    <div className="flex min-w-[220px] flex-wrap items-center gap-1.5">
      {canActivate && (
        <ActionButton
          disabled={isPending}
          onClick={() => onToggle(extension.id, true)}
        >
          Activate
        </ActionButton>
      )}
      {canDeactivate && (
        <ActionButton
          disabled={isPending}
          onClick={() => onToggle(extension.id, false)}
        >
          Deactivate
        </ActionButton>
      )}
      {copyTarget && (
        <ActionButton onClick={() => copyText(copyTarget, "Package copied")}>
          Copy pkg
        </ActionButton>
      )}
      {npmPackage && (
        <ActionButton
          onClick={() =>
            openExternal(`https://www.npmjs.com/package/${npmPackage}`)
          }
        >
          npm
        </ActionButton>
      )}
      {extension.docs_url && (
        <ActionButton onClick={() => openExternal(extension.docs_url!)}>
          Docs
        </ActionButton>
      )}
    </div>
  )
}

const ExtensionRow = ({
  extension,
  onToggle,
  isPending,
}: {
  extension: ExtensionCatalogItem
  onToggle: (id: string, enabled: boolean) => void
  isPending: boolean
}) => (
  <Table.Row>
    <Table.Cell>
      <div className="flex flex-col gap-1 py-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text weight="plus">{extension.name}</Text>
          <Badge size="2xsmall" color="grey">
            {KIND_LABELS[extension.kind]}
          </Badge>
          <StatusBadge status={extension.status} />
          {extension.update_available && (
            <Badge size="2xsmall" color="orange">
              Update
            </Badge>
          )}
        </div>
        <Text size="small" className="max-w-md text-ui-fg-subtle">
          {extension.description}
        </Text>
        {extension.author && (
          <Text size="xsmall" className="text-ui-fg-muted">
            {extension.author}
          </Text>
        )}
      </div>
    </Table.Cell>
    <Table.Cell>
      <VersionCell extension={extension} />
    </Table.Cell>
    <Table.Cell>
      <PackageCell extension={extension} />
    </Table.Cell>
    <Table.Cell>
      <RowActions
        extension={extension}
        onToggle={onToggle}
        isPending={isPending}
      />
    </Table.Cell>
  </Table.Row>
)

const SystemExtensionsPage = () => {
  const queryClient = useQueryClient()
  const [kindFilter, setKindFilter] = useState<FilterKind>("all")
  const [search, setSearch] = useState("")

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["admin-system-extensions"],
    queryFn: () => systemExtensionsClient.getCatalog(),
  })

  const refreshMutation = useMutation({
    mutationFn: () => systemExtensionsClient.getCatalog({ refresh: true }),
    onSuccess: (catalog) => {
      queryClient.setQueryData(["admin-system-extensions"], catalog)
      toast.success(
        catalog.updates_available
          ? `Refreshed · ${catalog.updates_available} update(s) available`
          : "Refreshed · all packages up to date"
      )
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      enabled,
    }: {
      id: string
      enabled: boolean
    }) => systemExtensionsClient.toggleExtension(id, enabled),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-extensions"] })
      toast.success(
        response.enabled
          ? "Extension activated — restart backend to apply"
          : "Extension deactivated — restart backend to apply"
      )
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  })

  const acknowledgeMutation = useMutation({
    mutationFn: () => systemExtensionsClient.acknowledgeRestart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-extensions"] })
      toast.success("Restart notice dismissed")
    },
  })

  const filtered = useMemo(() => {
    const extensions = data?.extensions ?? []
    const needle = search.trim().toLowerCase()

    return extensions.filter((extension) => {
      if (kindFilter !== "all" && extension.kind !== kindFilter) {
        return false
      }

      if (!needle) {
        return true
      }

      const haystack = [
        extension.name,
        extension.description,
        extension.package_name,
        extension.resolve,
        extension.tracked_package,
        extension.author,
        ...(extension.related_packages?.map((pkg) => pkg.package_name) ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [data?.extensions, kindFilter, search])

  const isRefreshing = refreshMutation.isPending || isFetching

  return (
    <Container className="divide-y p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <Text
            size="xsmall"
            className="text-ui-fg-muted uppercase tracking-wide"
          >
            System
          </Text>
          <Heading level="h1" className="mt-1">
            Extensions
          </Heading>
          <Text size="small" className="mt-1 text-ui-fg-subtle">
            Inventory for apps, plugins, modules, and toolchain versions
          </Text>
          {data?.checked_at && (
            <Text size="xsmall" className="mt-2 text-ui-fg-muted">
              Last checked {new Date(data.checked_at).toLocaleString()}
            </Text>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            isLoading={isRefreshing}
            onClick={() => refreshMutation.mutate()}
          >
            <ArrowPath />
            Refresh versions
          </Button>
          <Button size="small" variant="secondary" asChild>
            <Link to="/system">System home</Link>
          </Button>
        </div>
      </header>

      {data?.requires_restart && (
        <div className="px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
            <div>
              <Text weight="plus">Backend restart required</Text>
              <Text size="small" className="text-ui-fg-subtle">
                Extension toggles apply after restarting the Medusa process.
              </Text>
            </div>
            <Button
              size="small"
              variant="secondary"
              isLoading={acknowledgeMutation.isPending}
              onClick={() => acknowledgeMutation.mutate()}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {data?.runtime && (
        <Section
          title="Runtime & toolchain"
          meta={
            data.updates_available > 0 ? (
              <Badge color="orange" size="2xsmall">
                {data.updates_available} update
                {data.updates_available === 1 ? "" : "s"}
              </Badge>
            ) : (
              <Badge color="green" size="2xsmall">
                Up to date
              </Badge>
            )
          }
        >
          <RuntimeStrip runtime={data.runtime} />
          {data.updates_available > 0 && (
            <Text size="small" className="mt-3 text-ui-fg-subtle">
              Install upgrades with{" "}
              <code className="rounded bg-ui-bg-component px-1.5 py-0.5 font-mono text-xs">
                pnpm update
              </code>
              , then restart the backend.
            </Text>
          )}
        </Section>
      )}

      <Section
        title="Catalog"
        meta={
          <Text size="small" className="text-ui-fg-muted">
            {filtered.length} shown
          </Text>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              value={kindFilter}
              onValueChange={(value) => setKindFilter(value as FilterKind)}
            >
              <Select.Trigger>
                <Select.Value placeholder="All types" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="all">All types</Select.Item>
                <Select.Item value="app">Apps</Select.Item>
                <Select.Item value="plugin">Plugins</Select.Item>
                <Select.Item value="module">Modules</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <input
            className="min-w-[240px] flex-1 rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none focus:border-ui-border-interactive"
            placeholder="Search name, package, resolve…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {isLoading && <Text>Loading extensions…</Text>}
        {error && (
          <Text className="text-ui-fg-error">{(error as Error).message}</Text>
        )}

        {!isLoading && !error && (
          <div className="overflow-x-auto rounded-md border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Extension</Table.HeaderCell>
                  <Table.HeaderCell>Version</Table.HeaderCell>
                  <Table.HeaderCell>Package</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.map((extension) => (
                  <ExtensionRow
                    key={extension.id}
                    extension={extension}
                    isPending={toggleMutation.isPending}
                    onToggle={(id, enabled) =>
                      toggleMutation.mutate({ id, enabled })
                    }
                  />
                ))}

                {!filtered.length && (
                  <Table.Row>
                    <Table.Cell>
                      <Text className="py-6 text-ui-fg-subtle">
                        No extensions match your filters.
                      </Text>
                    </Table.Cell>
                    <Table.Cell />
                    <Table.Cell />
                    <Table.Cell />
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        )}

        <Text size="small" className="mt-4 text-ui-fg-subtle">
          Core Medusa modules stay always-on. Custom plugins and modules can be
          toggled here. Trade settings live under{" "}
          <Link
            to="/b2b/settings"
            className="text-ui-fg-interactive hover:underline"
          >
            B2B settings
          </Link>
          .
        </Text>
      </Section>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Extensions",
  icon: Puzzle,
})

export default SystemExtensionsPage
