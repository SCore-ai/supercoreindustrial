import type { ExtensionKind } from "./types"

export type ExtensionRegistryEntry = {
  id: string
  kind: ExtensionKind
  name: string
  description: string
  package_name?: string
  resolve?: string
  configurable: boolean
  docs_url?: string
  author?: string
  /** When true, listed only if package is installed */
  optional?: boolean
}

export const EXTENSION_REGISTRY: ExtensionRegistryEntry[] = [
  {
    id: "backend",
    kind: "app",
    name: "Backend",
    description:
      "Medusa API server, admin dashboard host, and custom commerce modules.",
    package_name: "@dtc/backend",
    configurable: false,
    docs_url: "https://docs.medusajs.com",
    author: "Supercore",
  },
  {
    id: "admin-dashboard",
    kind: "app",
    name: "Admin dashboard",
    description: "Medusa Admin UI package served from the backend.",
    package_name: "@medusajs/dashboard",
    configurable: false,
    docs_url: "https://docs.medusajs.com/resources/admin-components",
    author: "Medusa",
  },
  {
    id: "storefront",
    kind: "app",
    name: "Storefront",
    description: "Next.js customer-facing storefront (Turbopack / production).",
    package_name: "@dtc/storefront",
    configurable: false,
    docs_url: "https://docs.medusajs.com/resources/nextjs-starter",
    author: "Supercore",
  },
  {
    id: "loyalty",
    kind: "plugin",
    name: "Loyalty",
    description: "Customer loyalty points and rewards (Medusa official plugin).",
    package_name: "@medusajs/loyalty-plugin",
    resolve: "@medusajs/loyalty-plugin",
    configurable: true,
    docs_url: "https://docs.medusajs.com/resources/commerce-modules/loyalty",
    author: "Medusa",
  },
  {
    id: "draft-order",
    kind: "plugin",
    name: "Draft orders",
    description: "Create and manage draft orders from the admin.",
    package_name: "@medusajs/draft-order",
    resolve: "@medusajs/draft-order",
    configurable: true,
    optional: true,
    docs_url: "https://docs.medusajs.com",
    author: "Medusa",
  },
  {
    id: "quote",
    kind: "module",
    name: "Quote",
    description: "B2B quote carts, line items, and offer workflow.",
    resolve: "./src/modules/quote",
    configurable: true,
    author: "Supercore",
  },
  {
    id: "b2b",
    kind: "module",
    name: "B2B",
    description: "Trade accounts, pricing tiers, conversations, and B2B settings.",
    resolve: "./src/modules/b2b",
    configurable: true,
    author: "Supercore",
  },
  {
    id: "translation",
    kind: "module",
    name: "Translation",
    description: "Multi-language product and content translations.",
    resolve: "@medusajs/medusa/translation",
    package_name: "@medusajs/medusa",
    configurable: false,
    author: "Medusa",
  },
  {
    id: "analytics",
    kind: "module",
    name: "Analytics",
    description: "Store analytics with configurable providers.",
    resolve: "@medusajs/medusa/analytics",
    package_name: "@medusajs/medusa",
    configurable: false,
    author: "Medusa",
  },
  {
    id: "fulfillment",
    kind: "module",
    name: "Fulfillment",
    description: "Order fulfillment and manual shipping provider.",
    resolve: "@medusajs/medusa/fulfillment",
    package_name: "@medusajs/medusa",
    configurable: false,
    author: "Medusa",
  },
]

export function findRegistryEntry(id: string) {
  return EXTENSION_REGISTRY.find((entry) => entry.id === id) ?? null
}
