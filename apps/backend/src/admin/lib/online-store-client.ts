import type {
  OnlineStoreHomepageResponse,
  OnlineStoreNavigationResponse,
  OnlineStoreOverviewResponse,
  OnlineStorePreviewResponse,
  OnlineStoreThemeResponse,
  UpdateOnlineStoreHomepagePayload,
  UpdateOnlineStoreNavigationPayload,
  UpdateOnlineStoreThemePayload,
} from "./online-store-types"

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

export const onlineStoreClient = {
  getOverview() {
    return adminFetch<OnlineStoreOverviewResponse>("/admin/online-store")
  },

  getTheme() {
    return adminFetch<OnlineStoreThemeResponse>("/admin/online-store/theme")
  },

  updateTheme(body: UpdateOnlineStoreThemePayload) {
    return adminFetch<OnlineStoreThemeResponse>("/admin/online-store/theme", {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  getNavigation() {
    return adminFetch<OnlineStoreNavigationResponse>("/admin/online-store/navigation")
  },

  updateNavigation(body: UpdateOnlineStoreNavigationPayload) {
    return adminFetch<OnlineStoreNavigationResponse>("/admin/online-store/navigation", {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  resetNavigation() {
    return adminFetch<OnlineStoreNavigationResponse>("/admin/online-store/navigation", {
      method: "POST",
      body: JSON.stringify({ action: "reset" }),
    })
  },

  getHomepage() {
    return adminFetch<OnlineStoreHomepageResponse>("/admin/online-store/homepage")
  },

  updateHomepage(body: UpdateOnlineStoreHomepagePayload) {
    return adminFetch<OnlineStoreHomepageResponse>("/admin/online-store/homepage", {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  getPreviewToken() {
    return adminFetch<OnlineStorePreviewResponse>("/admin/online-store/preview-token")
  },

  publish() {
    return adminFetch<{ message: string }>("/admin/online-store/publish", {
      method: "POST",
    })
  },

  discardDraft() {
    return adminFetch<{ message: string }>("/admin/online-store/discard-draft", {
      method: "POST",
    })
  },
}
