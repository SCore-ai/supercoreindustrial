import { outboundFetch } from "../../http/outbound"
import {
  isUpdateAvailable,
  normalizeInstalledVersion,
} from "./package-versions"

type NpmRegistryResponse = {
  version?: string
}

const cache = new Map<string, { latest: string | null; checked_at: number }>()
const CACHE_TTL_MS = 15 * 60 * 1000

export function clearNpmVersionCache() {
  cache.clear()
}

export async function fetchLatestNpmVersion(
  packageName: string
): Promise<string | null> {
  const cached = cache.get(packageName)

  if (cached && Date.now() - cached.checked_at < CACHE_TTL_MS) {
    return cached.latest
  }

  try {
    const response = await outboundFetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`,
      {
        headers: { Accept: "application/json" },
      },
      { timeoutMs: 8000, retries: 1 }
    )

    if (!response.ok) {
      cache.set(packageName, { latest: null, checked_at: Date.now() })
      return null
    }

    const json = (await response.json()) as NpmRegistryResponse
    const latest = json.version ?? null
    cache.set(packageName, { latest, checked_at: Date.now() })
    return latest
  } catch {
    cache.set(packageName, { latest: null, checked_at: Date.now() })
    return null
  }
}

export async function resolvePackageVersions(packageName?: string | null) {
  if (!packageName) {
    return {
      latest_version: null,
      update_available: false,
    }
  }

  const latest = await fetchLatestNpmVersion(packageName)

  return {
    latest_version: latest,
    update_available: false,
  }
}

export function markUpdateAvailability(
  installed: string | null,
  latest: string | null
) {
  return {
    latest_version: latest,
    update_available: isUpdateAvailable(
      normalizeInstalledVersion(installed),
      latest
    ),
  }
}
