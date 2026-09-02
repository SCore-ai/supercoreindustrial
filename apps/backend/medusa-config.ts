import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { productEntityOverrides } from './src/lib/catalog/product-view-overrides'
import { getRequiredSecret } from './src/lib/security/secrets'
import { applyExtensionState } from './src/lib/system/extensions/runtime'
import { baseModules, basePlugins } from './src/lib/system/extensions/medusa-base-config'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

function getDatabaseSslMode() {
  const explicit = process.env.DATABASE_SSLMODE?.trim().toLowerCase()
  if (explicit) {
    return explicit
  }

  const url = process.env.DATABASE_URL ?? ""

  try {
    const parsed = new URL(url)
    const fromQuery = parsed.searchParams.get("sslmode")?.toLowerCase()
    if (fromQuery) {
      return fromQuery
    }
  } catch {
    // Fall through to substring checks for non-standard URLs.
  }

  if (url.includes("sslmode=verify-full")) {
    return "verify-full"
  }

  if (url.includes("sslmode=verify-ca")) {
    return "verify-ca"
  }

  if (url.includes("sslmode=require") || url.includes("ssl=true") || url.includes("uselibpqcompat=true")) {
    return "require"
  }

  return "disable"
}

function getDatabaseDriverOptions() {
  const sslMode = getDatabaseSslMode()

  if (sslMode === "disable" || sslMode === "allow" || sslMode === "prefer") {
    return {
      ssl: false,
      sslmode: "disable",
    }
  }

  return {
    ssl: {
      rejectUnauthorized: sslMode === "verify-ca" || sslMode === "verify-full",
    },
    sslmode: sslMode,
  }
}

module.exports = defineConfig({
  modules: [
    ...applyExtensionState(baseModules),
    {
      resolve: "@medusajs/medusa/settings",
      options: {
        entityOverrides: productEntityOverrides,
      },
    },
  ],
  featureFlags: {
    translation: process.env.MEDUSA_FF_TRANSLATION !== "false",
    view_configurations: process.env.MEDUSA_FF_VIEW_CONFIGURATIONS !== "false",
  },
  plugins: applyExtensionState(basePlugins),
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: getDatabaseDriverOptions(),
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: getRequiredSecret("JWT_SECRET"),
      cookieSecret: getRequiredSecret("COOKIE_SECRET"),
    },
  },
  admin: {
    vite: () => ({
      server: {
        host: '0.0.0.0',
        allowedHosts: ['localhost', '.localhost', '127.0.0.1'],
        hmr: {
          port: 5173,
          clientPort: 5173,
        },
      },
    }),
  },
})
