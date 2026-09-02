import fs from "fs"
import path from "path"
import { mapWithConcurrency } from "../../http/outbound"
import { EXTENSION_REGISTRY } from "./registry"
import { baseModules, basePlugins } from "./medusa-base-config"
import {
  normalizeInstalledVersion,
  readWorkspacePackageVersions,
} from "./package-versions"
import { readExtensionsState } from "./state"
import type {
  ExtensionCatalogItem,
  ExtensionPackageRef,
  ExtensionStatus,
  ExtensionsCatalogResponse,
  RuntimeVersions,
} from "./types"
import {
  clearNpmVersionCache,
  fetchLatestNpmVersion,
  markUpdateAvailability,
} from "./version-check"

type WorkspacePackages = ReturnType<
  typeof readWorkspacePackageVersions
>["packages"]

function getConfiguredEntries() {
  const activeResolves = new Set(
    [...basePlugins, ...baseModules].map((entry) => entry.resolve)
  )

  return { activeResolves }
}

function getInstalledPackageNames() {
  const pkgPath = path.join(process.cwd(), "package.json")

  if (!fs.existsSync(pkgPath)) {
    return new Set<string>()
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }

  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ])
}

function resolveLatestPackage(entry: (typeof EXTENSION_REGISTRY)[number]) {
  if (entry.id === "storefront") {
    return "next"
  }

  if (entry.id === "backend") {
    return "@medusajs/medusa"
  }

  if (entry.id === "admin-dashboard") {
    return "@medusajs/dashboard"
  }

  return entry.package_name ?? null
}

function resolveInstalledVersion(
  entry: (typeof EXTENSION_REGISTRY)[number],
  versions: WorkspacePackages
) {
  if (entry.id === "storefront") {
    return normalizeInstalledVersion(versions.next)
  }

  if (entry.id === "backend") {
    return normalizeInstalledVersion(versions["@medusajs/medusa"])
  }

  if (entry.id === "admin-dashboard") {
    return normalizeInstalledVersion(versions["@medusajs/dashboard"])
  }

  if (entry.kind === "module" && entry.resolve?.startsWith("./")) {
    return normalizeInstalledVersion(versions["@dtc/backend"])
  }

  if (entry.package_name && versions[entry.package_name as keyof WorkspacePackages]) {
    return normalizeInstalledVersion(
      versions[entry.package_name as keyof WorkspacePackages]
    )
  }

  return null
}

function resolveVersionMeta(
  entry: (typeof EXTENSION_REGISTRY)[number],
  versions: WorkspacePackages
) {
  if (entry.id === "storefront") {
    return {
      version_label: "Next.js",
      app_version: normalizeInstalledVersion(versions["@dtc/storefront"]),
    }
  }

  if (entry.id === "backend") {
    return {
      version_label: "Medusa",
      app_version: normalizeInstalledVersion(versions["@dtc/backend"]),
    }
  }

  if (entry.id === "admin-dashboard") {
    return {
      version_label: "Dashboard",
      app_version: null,
    }
  }

  if (entry.kind === "module" && entry.resolve?.startsWith("./")) {
    return {
      version_label: "Local module",
      app_version: normalizeInstalledVersion(versions["@dtc/backend"]),
    }
  }

  if (entry.package_name === "@medusajs/medusa") {
    return {
      version_label: "Medusa",
      app_version: null,
    }
  }

  return {
    version_label: null,
    app_version: null,
  }
}

function packageRef(
  label: string,
  packageName: string,
  versions: WorkspacePackages,
  latestByPackage: Map<string, string | null>
): ExtensionPackageRef {
  const version = normalizeInstalledVersion(
    versions[packageName as keyof WorkspacePackages] ?? null
  )
  const latest = latestByPackage.get(packageName) ?? null
  const updateInfo = markUpdateAvailability(version, latest)

  return {
    label,
    package_name: packageName,
    version,
    latest_version: updateInfo.latest_version,
    update_available: updateInfo.update_available,
  }
}

function resolveRelatedPackages(
  entry: (typeof EXTENSION_REGISTRY)[number],
  versions: WorkspacePackages,
  latestByPackage: Map<string, string | null>
): ExtensionPackageRef[] {
  if (entry.id === "backend") {
    return [
      packageRef("Framework", "@medusajs/framework", versions, latestByPackage),
      packageRef("Admin SDK", "@medusajs/admin-sdk", versions, latestByPackage),
      packageRef("Dashboard", "@medusajs/dashboard", versions, latestByPackage),
    ]
  }

  if (entry.id === "storefront") {
    return [
      packageRef("React", "react", versions, latestByPackage),
      packageRef("Next.js", "next", versions, latestByPackage),
    ]
  }

  if (entry.id === "admin-dashboard") {
    return [
      packageRef("Admin SDK", "@medusajs/admin-sdk", versions, latestByPackage),
      packageRef("Medusa", "@medusajs/medusa", versions, latestByPackage),
    ]
  }

  return []
}

function resolveStatus(
  entry: (typeof EXTENSION_REGISTRY)[number],
  activeResolves: Set<string>,
  disabled: Set<string>
): ExtensionStatus {
  if (entry.kind === "app") {
    return "active"
  }

  if (disabled.has(entry.id)) {
    return "inactive"
  }

  if (entry.resolve && activeResolves.has(entry.resolve)) {
    return "active"
  }

  return "installed"
}

async function buildRuntimeVersions(
  versions: WorkspacePackages,
  packageManager: string | null
): Promise<RuntimeVersions> {
  return {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    pnpm: packageManager?.replace(/^pnpm@/, "") ?? null,
    eslint: normalizeInstalledVersion(versions.eslint),
    typescript: normalizeInstalledVersion(versions.typescript),
    turbo: normalizeInstalledVersion(versions.turbo),
    medusa: normalizeInstalledVersion(versions["@medusajs/medusa"]),
    framework: normalizeInstalledVersion(versions["@medusajs/framework"]),
    admin_sdk: normalizeInstalledVersion(versions["@medusajs/admin-sdk"]),
    dashboard: normalizeInstalledVersion(versions["@medusajs/dashboard"]),
    storefront_next: normalizeInstalledVersion(versions.next),
    storefront_react: normalizeInstalledVersion(versions.react),
  }
}

export async function getExtensionsCatalog(options?: {
  refresh?: boolean
}): Promise<ExtensionsCatalogResponse> {
  if (options?.refresh) {
    clearNpmVersionCache()
  }

  const { activeResolves } = getConfiguredEntries()
  const state = readExtensionsState()
  const disabled = new Set(state.disabled)
  const installedPackages = getInstalledPackageNames()
  const workspace = readWorkspacePackageVersions()

  const npmPackages = [
    ...new Set(
      [
        ...EXTENSION_REGISTRY.map((entry) => entry.package_name),
        "next",
        "react",
        "eslint",
        "typescript",
        "turbo",
        "@medusajs/medusa",
        "@medusajs/framework",
        "@medusajs/admin-sdk",
        "@medusajs/dashboard",
      ].filter(Boolean)
    ),
  ] as string[]

  const latestByPackage = new Map<string, string | null>()

  const versionResults = await mapWithConcurrency(npmPackages, 4, async (packageName) => ({
    packageName,
    latest: await fetchLatestNpmVersion(packageName),
  }))

  for (const { packageName, latest } of versionResults) {
    latestByPackage.set(packageName, latest)
  }

  const extensions: ExtensionCatalogItem[] = []

  for (const entry of EXTENSION_REGISTRY) {
    if (
      entry.optional &&
      entry.package_name &&
      !installedPackages.has(entry.package_name)
    ) {
      continue
    }

    const version = resolveInstalledVersion(entry, workspace.packages)
    const versionMeta = resolveVersionMeta(entry, workspace.packages)
    const latestPackage = resolveLatestPackage(entry)
    const latest = latestPackage
      ? latestByPackage.get(latestPackage) ?? null
      : null
    const updateInfo = markUpdateAvailability(version, latest)
    const related = resolveRelatedPackages(
      entry,
      workspace.packages,
      latestByPackage
    )

    const relatedUpdate = related.some((item) => item.update_available)

    extensions.push({
      id: entry.id,
      kind: entry.kind,
      name: entry.name,
      description: entry.description,
      package_name: entry.package_name ?? null,
      resolve: entry.resolve ?? null,
      version,
      version_label: versionMeta.version_label,
      app_version: versionMeta.app_version,
      tracked_package: latestPackage,
      latest_version: updateInfo.latest_version,
      update_available: updateInfo.update_available || relatedUpdate,
      status: resolveStatus(entry, activeResolves, disabled),
      configurable: entry.configurable,
      docs_url: entry.docs_url ?? null,
      author: entry.author ?? null,
      related_packages: related,
    })
  }

  const updatesAvailable = extensions.filter(
    (extension) => extension.update_available
  ).length

  return {
    extensions,
    runtime: await buildRuntimeVersions(
      workspace.packages,
      workspace.package_manager
    ),
    updates_available: updatesAvailable,
    requires_restart: state.pending_restart ?? false,
    state_updated_at: state.updated_at,
    checked_at: new Date().toISOString(),
  }
}

export async function toggleExtension(id: string, enabled: boolean) {
  const entry = EXTENSION_REGISTRY.find((item) => item.id === id)

  if (!entry) {
    throw new Error("Extension not found")
  }

  if (!entry.configurable) {
    throw new Error("This extension cannot be toggled from the admin panel")
  }

  const { setExtensionEnabled } = await import("./state")
  const state = setExtensionEnabled(id, enabled)

  return {
    id,
    enabled,
    requires_restart: true,
    state,
  }
}
