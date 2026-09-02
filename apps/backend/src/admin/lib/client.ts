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
    let message = body || `Request failed (${response.status})`
    try {
      const parsed = JSON.parse(body) as { message?: string }
      if (parsed?.message) {
        message = parsed.message
      }
    } catch {
      // keep raw body
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export const b2bClient = {
  listQuotes(params?: {
    status?: string
    include_archived?: boolean
    archived_only?: boolean
    limit?: number
    offset?: number
  }) {
    const search = new URLSearchParams()

    if (params?.status) {
      search.set("status", params.status)
    }

    if (params?.include_archived) {
      search.set("include_archived", "true")
    }

    if (params?.archived_only) {
      search.set("archived_only", "true")
    }

    if (params?.limit !== undefined) {
      search.set("limit", String(params.limit))
    }

    if (params?.offset !== undefined) {
      search.set("offset", String(params.offset))
    }

    const query = search.toString()
    const path = query ? `/admin/b2b/quotes?${query}` : "/admin/b2b/quotes"

    return adminFetch<import("./types").AdminQuotesListResponse>(path)
  },

  getQuote(id: string) {
    return adminFetch<import("./types").AdminQuoteResponse>(
      `/admin/b2b/quotes/${id}`
    )
  },

  updateQuote(
    id: string,
    body: {
      status?: "draft" | "submitted"
      admin_status?: string
      order_id?: string | null
      admin_notes?: string | null
    }
  ) {
    return adminFetch<
      import("./types").AdminQuoteResponse & { order_id?: string }
    >(`/admin/b2b/quotes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  convertQuoteToOrder(id: string, body?: { admin_notes?: string | null }) {
    return adminFetch<{
      order_id: string
      quote: import("./types").AdminQuote
    }>(`/admin/b2b/quotes/${id}/convert`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    })
  },

  updateIntegration(id: string, body: import("./types").QuoteErpMetadata) {
    return adminFetch<import("./types").AdminQuoteResponse>(
      `/admin/b2b/quotes/${id}/integration`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
  },

  archiveQuote(id: string) {
    return adminFetch<import("./types").AdminQuoteResponse>(
      `/admin/b2b/quotes/${id}/archive`,
      { method: "POST" }
    )
  },

  restoreQuote(id: string) {
    return adminFetch<import("./types").AdminQuoteResponse>(
      `/admin/b2b/quotes/${id}/restore`,
      { method: "POST" }
    )
  },

  deleteQuote(id: string) {
    return adminFetch<{ id: string; deleted: boolean }>(
      `/admin/b2b/quotes/${id}`,
      { method: "DELETE" }
    )
  },

  async getQuoteByOrderId(orderId: string) {
    const response = await fetch(`/admin/b2b/quotes/by-order/${orderId}`, {
      credentials: "include",
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const body = await response.text()
      throw new Error(body || `Request failed (${response.status})`)
    }

    return response.json() as Promise<import("./types").AdminQuoteResponse>
  },

  getDashboard() {
    return adminFetch<import("./types").AdminDashboardResponse>(
      "/admin/b2b/dashboard"
    )
  },

  listCompanies(params?: {
    status?: string
    limit?: number
    offset?: number
  }) {
    const search = new URLSearchParams()

    if (params?.status) {
      search.set("status", params.status)
    }

    if (params?.limit !== undefined) {
      search.set("limit", String(params.limit))
    }

    if (params?.offset !== undefined) {
      search.set("offset", String(params.offset))
    }

    const query = search.toString()
    const path = query
      ? `/admin/b2b/companies?${query}`
      : "/admin/b2b/companies"

    return adminFetch<import("./types").AdminCompaniesListResponse>(path)
  },

  getCompany(id: string) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${id}`
    )
  },

  approveCompany(id: string, body?: { customer_group_id?: string | null }) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      }
    )
  },

  resendTradeAccountWelcome(id: string) {
    return adminFetch<{
      company: import("./types").B2bCompany
      primary_customer_id: string
      password_setup_sent: boolean
    }>(`/admin/b2b/companies/${id}/resend-welcome`, {
      method: "POST",
    })
  },

  rejectCompany(id: string, body?: { admin_notes?: string | null }) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      }
    )
  },

  archiveCompany(id: string) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${id}/archive`,
      { method: "POST" }
    )
  },

  restoreCompany(id: string) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${id}/restore`,
      { method: "POST" }
    )
  },

  deleteCompany(id: string) {
    return adminFetch<{ id: string; deleted: boolean }>(
      `/admin/b2b/companies/${id}`,
      { method: "DELETE" }
    )
  },

  sendQuoteOffer(
    id: string,
    body: {
      currency_code?: string | null
      valid_until?: string | null
      admin_notes?: string | null
      line_items?: Array<{
        id: string
        unit_price?: number | null
        discount_percent?: number
      }>
    }
  ) {
    return adminFetch<import("./types").AdminQuoteResponse>(
      `/admin/b2b/quotes/${id}/offer`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
  },

  async downloadQuotePdf(id: string) {
    const response = await fetch(`/admin/b2b/quotes/${id}/pdf`, {
      credentials: "include",
    })

    if (!response.ok) {
      const body = await response.text()
      let message = body || `Request failed (${response.status})`
      try {
        const parsed = JSON.parse(body) as { message?: string }
        if (parsed?.message) {
          message = parsed.message
        }
      } catch {
        // keep raw body
      }
      throw new Error(message)
    }

    const blob = await response.blob()
    const disposition = response.headers.get("content-disposition")
    const match = disposition?.match(/filename="([^"]+)"/)
    const filename = match?.[1] ?? `Supercore_Quote_${id.slice(-8).toUpperCase()}.pdf`
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  },

  listOrderApprovals(params?: { status?: string; limit?: number; offset?: number }) {
    const search = new URLSearchParams()
    if (params?.status) search.set("status", params.status)
    if (params?.limit !== undefined) search.set("limit", String(params.limit))
    if (params?.offset !== undefined) search.set("offset", String(params.offset))
    const q = search.toString()
    return adminFetch<import("./types").OrderApprovalsListResponse>(
      q ? `/admin/b2b/order-approvals?${q}` : "/admin/b2b/order-approvals"
    )
  },

  approveOrder(id: string, body?: { notes?: string | null }) {
    return adminFetch<{ approval: import("./types").B2bOrderApproval }>(
      `/admin/b2b/order-approvals/${id}/approve`,
      { method: "POST", body: JSON.stringify(body ?? {}) }
    )
  },

  rejectOrder(id: string, body?: { notes?: string | null }) {
    return adminFetch<{ approval: import("./types").B2bOrderApproval }>(
      `/admin/b2b/order-approvals/${id}/reject`,
      { method: "POST", body: JSON.stringify(body ?? {}) }
    )
  },

  listConversations(params?: { status?: string; limit?: number; offset?: number }) {
    const search = new URLSearchParams()
    if (params?.status) search.set("status", params.status)
    if (params?.limit !== undefined) search.set("limit", String(params.limit))
    if (params?.offset !== undefined) search.set("offset", String(params.offset))
    const q = search.toString()
    return adminFetch<import("./types").ConversationsListResponse>(
      q ? `/admin/b2b/conversations?${q}` : "/admin/b2b/conversations"
    )
  },

  getConversation(id: string) {
    return adminFetch<{ conversation: import("./types").B2bConversation }>(
      `/admin/b2b/conversations/${id}`
    )
  },

  createConversation(body: {
    subject: string
    company_id?: string | null
    quote_id?: string | null
    order_id?: string | null
    customer_id?: string | null
    initial_message?: string
  }) {
    return adminFetch<{
      conversation: import("./types").B2bConversation
      emailed?: boolean
    }>("/admin/b2b/conversations", {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  replyConversation(id: string, body: { body: string }) {
    return adminFetch<{
      conversation: import("./types").B2bConversation
      emailed?: boolean
    }>(`/admin/b2b/conversations/${id}`, {
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  archiveConversation(id: string) {
    return adminFetch<{ conversation: import("./types").B2bConversation }>(
      `/admin/b2b/conversations/${id}/archive`,
      { method: "POST" }
    )
  },

  restoreConversation(id: string) {
    return adminFetch<{ conversation: import("./types").B2bConversation }>(
      `/admin/b2b/conversations/${id}/restore`,
      { method: "POST" }
    )
  },

  deleteConversation(id: string) {
    return adminFetch<{ id: string; deleted: boolean }>(
      `/admin/b2b/conversations/${id}`,
      { method: "DELETE" }
    )
  },

  listPricingTiers(params?: { variant_id?: string; status?: string }) {
    const search = new URLSearchParams()
    if (params?.variant_id) search.set("variant_id", params.variant_id)
    if (params?.status) search.set("status", params.status)
    const q = search.toString()
    return adminFetch<import("./types").PricingTiersListResponse>(
      q ? `/admin/b2b/pricing-tiers?${q}` : "/admin/b2b/pricing-tiers"
    )
  },

  createPricingTier(body: import("./types").PricingTierInput) {
    return adminFetch<{ tier: import("./types").B2bPricingTier }>(
      "/admin/b2b/pricing-tiers",
      { method: "POST", body: JSON.stringify(body) }
    )
  },

  updatePricingTier(id: string, body: Partial<import("./types").PricingTierInput>) {
    return adminFetch<{ tier: import("./types").B2bPricingTier }>(
      `/admin/b2b/pricing-tiers/${id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    )
  },

  deletePricingTier(id: string) {
    return adminFetch<{ id: string; deleted: boolean }>(
      `/admin/b2b/pricing-tiers/${id}`,
      { method: "DELETE" }
    )
  },

  addCompanyMember(
    companyId: string,
    body: {
      email?: string | null
      customer_id?: string | null
      first_name?: string | null
      last_name?: string | null
      role?: "admin" | "buyer" | "approver"
    }
  ) {
    return adminFetch<{ member: import("./types").B2bCompanyMember }>(
      `/admin/b2b/companies/${companyId}/members`,
      { method: "POST", body: JSON.stringify(body) }
    )
  },

  updateCompany(
    id: string,
    body: {
      name?: string
      legal_name?: string | null
      email?: string
      phone?: string | null
      vat_number?: string | null
      registration_number?: string | null
      website?: string | null
      country_code?: string | null
      admin_notes?: string | null
      require_order_approval?: boolean
      customer_group_id?: string | null
      metadata?: Record<string, unknown> | null
    }
  ) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${id}`,
      { method: "PATCH", body: JSON.stringify(body) }
    )
  },

  removeCompanyMember(companyId: string, memberId: string) {
    return adminFetch<{ id: string; deleted: boolean }>(
      `/admin/b2b/companies/${companyId}/members/${memberId}`,
      { method: "DELETE" }
    )
  },

  setCompanyPrimaryContact(companyId: string, memberId: string) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${companyId}/members/${memberId}/set-primary`,
      { method: "POST" }
    )
  },

  sendB2bAccessEmail(companyId: string, body?: { email?: string | null }) {
    return adminFetch<{ company_id: string; email: string; sent: boolean }>(
      `/admin/b2b/companies/${companyId}/send-b2b-access`,
      { method: "POST", body: JSON.stringify(body ?? {}) }
    )
  },

  sendCustomerPasswordReset(customerId: string) {
    return adminFetch<{ sent: boolean; email: string }>(
      `/admin/customers/${customerId}/reset-password`,
      { method: "POST" }
    )
  },

  listCustomerGroups() {
    return adminFetch<import("./types").AdminCustomerGroupsListResponse>(
      "/admin/b2b/groups"
    )
  },

  createCustomerGroup(body: { name: string }) {
    return adminFetch<{ group: { id: string; name?: string } }>(
      "/admin/b2b/groups",
      { method: "POST", body: JSON.stringify(body) }
    )
  },

  renameCustomerGroup(id: string, name: string) {
    return adminFetch<{ id: string; name: string }>(
      `/admin/b2b/groups/${id}`,
      { method: "POST", body: JSON.stringify({ name }) }
    )
  },

  deleteCustomerGroup(id: string) {
    return adminFetch<{ id: string; deleted: boolean }>(
      `/admin/b2b/groups/${id}`,
      { method: "DELETE" }
    )
  },

  assignCompanyCustomerGroup(
    companyId: string,
    customerGroupId: string | null
  ) {
    return adminFetch<import("./types").AdminCompanyResponse>(
      `/admin/b2b/companies/${companyId}/group`,
      {
        method: "POST",
        body: JSON.stringify({ customer_group_id: customerGroupId }),
      }
    )
  },

  linkCustomersToGroup(
    groupId: string,
    body: { add?: string[]; remove?: string[] }
  ) {
    return adminFetch<{ id: string; added: number; removed: number }>(
      `/admin/b2b/groups/${groupId}/customers`,
      { method: "POST", body: JSON.stringify(body) }
    )
  },

  getSettings() {
    return adminFetch<import("./types").AdminB2bSettingsResponse>(
      "/admin/b2b/settings"
    )
  },

  updateSettings(body: import("./types").UpdateB2bSettingsInput) {
    return adminFetch<import("./types").AdminB2bSettingsResponse>(
      "/admin/b2b/settings",
      {
        method: "PATCH",
        body: JSON.stringify(body),
      }
    )
  },

  testEmail(body: { to?: string; verify_only?: boolean }) {
    return adminFetch<import("./types").B2bEmailTestResult>(
      "/admin/b2b/settings/email/test",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    )
  },
}
