import { getDisabledExtensionIds } from "./state"
import { EXTENSION_REGISTRY } from "./registry"

type ConfigEntry = {
  resolve: string
  options?: Record<string, unknown>
}

function resolveToId(resolve: string) {
  const entry = EXTENSION_REGISTRY.find((item) => item.resolve === resolve)

  if (entry) {
    return entry.id
  }

  if (resolve.includes("/modules/quote")) {
    return "quote"
  }

  if (resolve.includes("/modules/b2b")) {
    return "b2b"
  }

  return resolve
}

export function applyExtensionState<T extends ConfigEntry>(entries: T[]): T[] {
  const disabled = getDisabledExtensionIds()

  return entries.filter((entry) => !disabled.has(resolveToId(entry.resolve)))
}
