export const LEGACY_DEVICES_HANDLE = "legacy-devices"

export function isEolLifecycle(value: unknown) {
  return String(value ?? "").trim().toLowerCase() === "eol"
}

/** Keep EOL products under `legacy-devices` instead of remapping them. */
export function isLegacyDevicePlacement(input: {
  categoryHandle?: string | null
  lifecycle?: unknown
  folderPath?: string | null
}) {
  if (isEolLifecycle(input.lifecycle)) {
    return true
  }
  if (input.categoryHandle === LEGACY_DEVICES_HANDLE) {
    return true
  }
  const parts = String(input.folderPath ?? "")
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
  return parts.includes(LEGACY_DEVICES_HANDLE)
}

export function successorHandleFromMeta(meta: {
  successor_handle?: unknown
  successor_slug?: unknown
}) {
  const handle = String(meta.successor_handle ?? "").trim()
  if (handle) {
    return handle
  }
  const slug = String(meta.successor_slug ?? "").trim()
  return slug || null
}

export function isLegacyMedusaProduct(product: {
  metadata?: Record<string, unknown> | null
  categories?: Array<{ handle?: string | null }> | null
}) {
  const metadata = product.metadata ?? {}
  const categoryHandles = (product.categories ?? [])
    .map((category) => category.handle)
    .filter(Boolean) as string[]
  return isLegacyDevicePlacement({
    categoryHandle:
      categoryHandles.find((handle) => handle === LEGACY_DEVICES_HANDLE) ??
      (typeof metadata.category_handle === "string"
        ? metadata.category_handle
        : categoryHandles[0] ?? null),
    lifecycle: metadata.lifecycle,
    folderPath:
      typeof metadata.category_path === "string"
        ? metadata.category_path
        : null,
  })
}

export function legacyProductFields(
  meta: {
    lifecycle?: unknown
    category_handle?: unknown
    original_category_handle?: unknown
    successor_handle?: unknown
    successor_slug?: unknown
  },
  mappedLiveHandle?: string | null
) {
  const successor = successorHandleFromMeta(meta)
  const previousHandle = String(meta.category_handle ?? "").trim()
  const mapped = String(mappedLiveHandle ?? "").trim()
  const original =
    String(meta.original_category_handle ?? "").trim() ||
    (previousHandle && previousHandle !== LEGACY_DEVICES_HANDLE
      ? previousHandle
      : mapped && mapped !== LEGACY_DEVICES_HANDLE && mapped !== "_unmapped"
        ? mapped
        : "")

  return {
    lifecycle: "eol",
    ...(successor ? { successor_handle: successor } : {}),
    ...(original ? { original_category_handle: original } : {}),
  }
}
