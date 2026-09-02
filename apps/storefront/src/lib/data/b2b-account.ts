"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type QuoteAdminStatus =
  | "new"
  | "in_review"
  | "quoted"
  | "won"
  | "lost"
  | "cancelled"

export type StoreB2bAccountSummary = {
  company: {
    id: string
    name: string
    status: string
    require_order_approval: boolean
  } | null
  member: {
    role: string
    is_primary: boolean
  } | null
  permissions?: {
    can_approve_orders: boolean
    can_manage_members?: boolean
  }
  counts: {
    quotes: number
    conversations: number
    pending_approvals: number
  }
}

export type StoreB2bQuoteSummary = {
  id: string
  status: string
  admin_status: QuoteAdminStatus | null
  email?: string | null
  company?: string | null
  project?: string | null
  currency_code?: string | null
  valid_until?: string | null
  item_count: number
  offer_total: number | null
  created_at?: string
  updated_at?: string
}

export type StoreB2bQuoteDetail = {
  id: string
  status: string
  admin_status: QuoteAdminStatus | null
  order_id?: string | null
  email?: string | null
  company?: string | null
  project?: string | null
  notes?: string | null
  currency_code?: string | null
  valid_until?: string | null
  offer_total?: number | null
  created_at?: string
  updated_at?: string
  items: Array<{
    id: string
    variant_id: string
    title?: string | null
    sku?: string | null
    thumbnail?: string | null
    quantity: number
    unit_price?: number | null
    discount_percent?: number | null
    line_total?: number | null
  }>
}

export type StoreB2bConversation = {
  id: string
  subject: string
  status: "open" | "closed"
  quote_id?: string | null
  order_id?: string | null
  updated_at?: string
  created_at?: string
  messages?: StoreB2bMessage[]
  last_message?: StoreB2bMessage | null
}

export type StoreB2bMessage = {
  id: string
  body: string
  sender_type: "admin" | "customer" | "system"
  sender_name?: string | null
  created_at?: string
}

export type StoreB2bOrderApproval = {
  id: string
  order_id: string
  status: "pending" | "approved" | "rejected"
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type StoreB2bOrderApprovalsResponse = {
  approvals: StoreB2bOrderApproval[]
  count: number
  permissions?: {
    can_approve_orders: boolean
  }
}

async function b2bFetch<T>(path: string, init?: RequestInit) {
  const headers = {
    ...(await getAuthHeaders()),
    ...(init?.headers ?? {}),
  }

  return sdk.client.fetch<T>(path, {
    ...init,
    headers,
    cache: "no-store",
  })
}

export async function fetchB2bAccountSummary(): Promise<StoreB2bAccountSummary | null> {
  return b2bFetch<StoreB2bAccountSummary>("/store/b2b/account", {
    method: "GET",
  }).catch(() => null)
}

export async function listB2bQuotes(): Promise<StoreB2bQuoteSummary[]> {
  const response = await b2bFetch<{ quotes: StoreB2bQuoteSummary[] }>(
    "/store/b2b/quotes",
    { method: "GET" }
  ).catch(() => null)

  return response?.quotes ?? []
}

export async function retrieveB2bQuote(
  quoteId: string
): Promise<StoreB2bQuoteDetail | null> {
  return b2bFetch<{ quote: StoreB2bQuoteDetail }>(`/store/b2b/quotes/${quoteId}`, {
    method: "GET",
  })
    .then(({ quote }) => quote)
    .catch(() => null)
}

export async function listB2bConversations(): Promise<StoreB2bConversation[]> {
  const response = await b2bFetch<{ conversations: StoreB2bConversation[] }>(
    "/store/b2b/conversations",
    { method: "GET" }
  ).catch(() => null)

  return response?.conversations ?? []
}

export async function retrieveB2bConversation(
  conversationId: string
): Promise<StoreB2bConversation | null> {
  return b2bFetch<{ conversation: StoreB2bConversation }>(
    `/store/b2b/conversations/${conversationId}`,
    { method: "GET" }
  )
    .then(({ conversation }) => conversation)
    .catch(() => null)
}

export async function createB2bConversation(input: {
  subject: string
  quote_id?: string | null
  order_id?: string | null
  initial_message?: string
  sender_name?: string | null
}) {
  return b2bFetch<{ conversation: StoreB2bConversation }>(
    "/store/b2b/conversations",
    {
      method: "POST",
      body: input,
    }
  )
    .then(({ conversation }) => conversation)
    .catch(medusaError)
}

export async function replyToB2bConversation(input: {
  conversationId: string
  body: string
  sender_name?: string | null
}) {
  return b2bFetch<{ conversation: StoreB2bConversation }>(
    `/store/b2b/conversations/${input.conversationId}`,
    {
      method: "POST",
      body: {
        body: input.body,
        sender_name: input.sender_name,
      },
    }
  )
    .then(({ conversation }) => conversation)
    .catch(medusaError)
}

export async function listB2bOrderApprovals(): Promise<StoreB2bOrderApprovalsResponse> {
  const response = await b2bFetch<StoreB2bOrderApprovalsResponse>(
    "/store/b2b/order-approvals",
    { method: "GET" }
  ).catch(() => null)

  return {
    approvals: response?.approvals ?? [],
    count: response?.count ?? 0,
    permissions: response?.permissions ?? { can_approve_orders: false },
  }
}

export async function approveB2bOrderApproval(input: {
  approvalId: string
  notes?: string | null
}) {
  return b2bFetch<{ approval: StoreB2bOrderApproval }>(
    `/store/b2b/order-approvals/${input.approvalId}/approve`,
    {
      method: "POST",
      body: { notes: input.notes ?? null },
    }
  )
    .then(({ approval }) => approval)
    .catch(medusaError)
}

export async function rejectB2bOrderApproval(input: {
  approvalId: string
  notes?: string | null
}) {
  return b2bFetch<{ approval: StoreB2bOrderApproval }>(
    `/store/b2b/order-approvals/${input.approvalId}/reject`,
    {
      method: "POST",
      body: { notes: input.notes ?? null },
    }
  )
    .then(({ approval }) => approval)
    .catch(medusaError)
}

export type StoreB2bMember = {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  role: "admin" | "buyer" | "approver" | string
  status: "active" | "invited" | "disabled" | string
  is_primary: boolean
  created_at?: string | null
}

export type StoreB2bMembersResponse = {
  members: StoreB2bMember[]
  count: number
  company: {
    id: string
    name: string
    status: string
  } | null
  permissions: {
    can_manage_members: boolean
  }
}

export async function listB2bMembers(): Promise<StoreB2bMembersResponse> {
  const response = await b2bFetch<StoreB2bMembersResponse>(
    "/store/b2b/members",
    { method: "GET" }
  ).catch(() => null)

  return {
    members: response?.members ?? [],
    count: response?.count ?? 0,
    company: response?.company ?? null,
    permissions: response?.permissions ?? { can_manage_members: false },
  }
}

export async function inviteB2bMember(input: {
  email: string
  role: "admin" | "buyer" | "approver"
  first_name?: string | null
  last_name?: string | null
}) {
  return b2bFetch<{
    member: StoreB2bMember
    password_setup_sent: boolean
  }>("/store/b2b/members", {
    method: "POST",
    body: input,
  }).catch(medusaError)
}

export async function updateB2bMember(input: {
  memberId: string
  role?: "admin" | "buyer" | "approver"
  status?: "active" | "invited" | "disabled"
}) {
  return b2bFetch<{ member: StoreB2bMember }>(
    `/store/b2b/members/${input.memberId}`,
    {
      method: "POST",
      body: {
        role: input.role,
        status: input.status,
      },
    }
  )
    .then(({ member }) => member)
    .catch(medusaError)
}

export async function removeB2bMember(memberId: string) {
  return b2bFetch<{ id: string; deleted: boolean }>(
    `/store/b2b/members/${memberId}`,
    { method: "DELETE" }
  ).catch(medusaError)
}

export async function resendB2bMemberInvite(memberId: string) {
  return b2bFetch<{
    member: StoreB2bMember
    password_setup_sent: boolean
  }>(`/store/b2b/members/${memberId}/resend`, {
    method: "POST",
  }).catch(medusaError)
}
