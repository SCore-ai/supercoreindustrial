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

export const ordersClient = {
  list(params?: {
    limit?: number
    offset?: number
    status?: string
    q?: string
    test_drafts_only?: boolean
    archived_only?: boolean
  }) {
    const search = new URLSearchParams()

    if (params?.limit !== undefined) {
      search.set("limit", String(params.limit))
    }

    if (params?.offset !== undefined) {
      search.set("offset", String(params.offset))
    }

    if (params?.status && params.status !== "all") {
      search.set("status", params.status)
    }

    if (params?.q?.trim()) {
      search.set("q", params.q.trim())
    }

    if (params?.test_drafts_only) {
      search.set("test_drafts_only", "true")
    }

    if (params?.archived_only) {
      search.set("archived_only", "true")
    }

    const query = search.toString()
    const path = query
      ? `/admin/orders/management?${query}`
      : "/admin/orders/management"

    return adminFetch<import("./orders-types").AdminOrdersListResponse>(path)
  },

  get(id: string) {
    return adminFetch<import("./orders-types").AdminOrderDetailResponse>(
      `/admin/orders/management/${id}`
    )
  },

  update(id: string, body: import("./orders-types").UpdateAdminOrderInput) {
    return adminFetch<import("./orders-types").AdminOrderDetailResponse>(
      `/admin/orders/management/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    )
  },

  runAction(
    id: string,
    action: import("./orders-types").OrderActionType
  ) {
    return adminFetch<import("./orders-types").AdminOrderDetailResponse>(
      `/admin/orders/management/${id}/actions`,
      {
        method: "POST",
        body: JSON.stringify({ action }),
      }
    )
  },

  createDraftOrder() {
    return adminFetch<import("./orders-types").AdminOrderMutationResponse>(
      "/admin/orders/management",
      {
        method: "POST",
        body: JSON.stringify({ action: "create_draft" }),
      }
    )
  },

  removeOrder(id: string) {
    return adminFetch<import("./orders-types").AdminOrderRemoveResponse>(
      `/admin/orders/management/${id}`,
      { method: "DELETE" }
    )
  },
}
