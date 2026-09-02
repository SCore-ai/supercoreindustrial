async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export const systemExtensionsClient = {
  getCatalog(options?: { refresh?: boolean }) {
    const query = options?.refresh ? "?refresh=true" : ""
    return adminFetch<
      import("./system-extensions-types").ExtensionsCatalogResponse
    >(`/admin/system/extensions${query}`)
  },

  toggleExtension(id: string, enabled: boolean) {
    return adminFetch<
      import("./system-extensions-types").ToggleExtensionResponse
    >(`/admin/system/extensions/${id}`, {
      method: "POST",
      body: JSON.stringify({ enabled }),
    })
  },

  acknowledgeRestart() {
    return adminFetch<{ ok: boolean }>("/admin/system/extensions/restart", {
      method: "PATCH",
      body: JSON.stringify({ pending_restart: false }),
    })
  },
}
