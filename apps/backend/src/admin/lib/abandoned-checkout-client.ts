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

export const abandonedCheckoutClient = {
  list(params?: {
    recovery_status?: string
    q?: string
    limit?: number
    offset?: number
  }) {
    const search = new URLSearchParams()

    if (params?.recovery_status && params.recovery_status !== "all") {
      search.set("recovery_status", params.recovery_status)
    }

    if (params?.q) {
      search.set("q", params.q)
    }

    if (params?.limit !== undefined) {
      search.set("limit", String(params.limit))
    }

    if (params?.offset !== undefined) {
      search.set("offset", String(params.offset))
    }

    const query = search.toString()
    const path = query
      ? `/admin/abandoned-checkouts?${query}`
      : "/admin/abandoned-checkouts"

    return adminFetch<import("./abandoned-checkout-types").AbandonedCheckoutsListResponse>(
      path
    )
  },

  get(id: string) {
    return adminFetch<import("./abandoned-checkout-types").AbandonedCheckoutResponse>(
      `/admin/abandoned-checkouts/${id}`
    )
  },

  updateNotes(id: string, adminNotes: string | null) {
    return adminFetch<import("./abandoned-checkout-types").AbandonedCheckoutResponse>(
      `/admin/abandoned-checkouts/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ admin_notes: adminNotes }),
      }
    )
  },

  sendRecoveryEmail(id: string, body?: { to?: string | null }) {
    return adminFetch<import("./abandoned-checkout-types").SendRecoveryEmailResponse>(
      `/admin/abandoned-checkouts/${id}/send-recovery-email`,
      {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      }
    )
  },
}
