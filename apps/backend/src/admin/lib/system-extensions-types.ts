export type ExtensionKind = "plugin" | "module" | "app" | "provider"

export type ExtensionStatus = "active" | "inactive" | "installed"

export type ExtensionPackageRef = {
  label: string
  package_name: string
  version: string | null
  latest_version: string | null
  update_available: boolean
}

export type ExtensionCatalogItem = {
  id: string
  kind: ExtensionKind
  name: string
  description: string
  package_name?: string | null
  resolve?: string | null
  version: string | null
  version_label?: string | null
  app_version?: string | null
  tracked_package?: string | null
  latest_version: string | null
  update_available: boolean
  status: ExtensionStatus
  configurable: boolean
  docs_url?: string | null
  author?: string | null
  related_packages?: ExtensionPackageRef[]
}

export type RuntimeVersions = {
  node: string
  platform: string
  arch: string
  pnpm: string | null
  eslint: string | null
  typescript: string | null
  turbo: string | null
  medusa: string | null
  framework: string | null
  admin_sdk: string | null
  dashboard: string | null
  storefront_next: string | null
  storefront_react: string | null
}

export type ExtensionsCatalogResponse = {
  extensions: ExtensionCatalogItem[]
  runtime: RuntimeVersions
  updates_available: number
  requires_restart: boolean
  state_updated_at?: string | null
  checked_at: string
}

export type ToggleExtensionResponse = {
  id: string
  enabled: boolean
  requires_restart: boolean
}
