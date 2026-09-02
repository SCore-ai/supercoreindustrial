"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"

export type B2bRegistrationMode = "quote_submit" | "dedicated_form" | "both"

export type StoreB2bSettings = {
  features: {
    conversations: boolean
    quotes: boolean
    order_approval: boolean
    tiered_pricing: boolean
    purchase_lists: boolean
    bulk_order_form: boolean
  }
  registration: {
    mode: B2bRegistrationMode
    path: string
    auto_approve: boolean
  }
  storefront: {
    hide_prices_for_guests: boolean
  }
}

export type TradeRegistrationPayload = {
  company_name: string
  contact_name: string
  email: string
  phone?: string
  vat_number?: string
  message?: string
  verification_token: string
}

export type TradeRegistrationCompany = {
  id: string
  name: string
  email: string
  status: string
}

export type B2bPricingTier = {
  id: string
  name: string
  unit_price?: number | null
  discount_percent?: number | null
  currency_code?: string | null
  min_quantity?: number | null
  max_quantity?: number | null
}

export type ResolvedB2bTierPrice = {
  tier: B2bPricingTier | null
  base_unit_price: number | null
  unit_price: number | null
  savings_percent: number | null
  quantity: number
  variant_id: string
  customer_group_id?: string | null
}

export async function fetchTierPrice(input: {
  variantId: string
  quantity?: number
  currencyCode?: string
  baseUnitPrice?: number | null
}): Promise<ResolvedB2bTierPrice | null> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const query: Record<string, string> = {
    variant_id: input.variantId,
    quantity: String(input.quantity ?? 1),
  }

  if (input.currencyCode) {
    query.currency_code = input.currencyCode
  }

  if (input.baseUnitPrice != null) {
    query.base_unit_price = String(input.baseUnitPrice)
  }

  return sdk.client
    .fetch<ResolvedB2bTierPrice>("/store/b2b/pricing", {
      method: "GET",
      query,
      headers,
      cache: "no-store",
    })
    .catch(() => null)
}

export async function applyB2bCartPricing(cartId: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  if (!headers.authorization) {
    return null
  }

  return sdk.client
    .fetch<{ cart_id: string; updated_items: number }>(
      `/store/carts/${cartId}/b2b-pricing`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      }
    )
    .catch(() => null)
}

export async function fetchStoreB2bSettings(): Promise<StoreB2bSettings | null> {
  const next = {
    ...(await getCacheOptions("b2b-settings")),
  }

  return sdk.client
    .fetch<{ settings: StoreB2bSettings }>("/store/b2b/settings", {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ settings }) => settings)
    .catch(() => null)
}

export async function sendTradeRegistrationVerification(email: string) {
  return sdk.client
    .fetch<{ email: string; message: string }>(
      "/store/b2b/register/send-verification",
      {
        method: "POST",
        body: { email: email.trim() },
        cache: "no-store",
      }
    )
    .catch(medusaError)
}

export async function verifyTradeRegistrationCode(input: {
  email: string
  code: string
}) {
  return sdk.client
    .fetch<{ email: string; verification_token: string }>(
      "/store/b2b/register/verify-code",
      {
        method: "POST",
        body: {
          email: input.email.trim(),
          code: input.code.trim(),
        },
        cache: "no-store",
      }
    )
    .catch(medusaError)
}

export async function submitTradeRegistration(payload: TradeRegistrationPayload) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const { company } = await sdk.client
    .fetch<{ company: TradeRegistrationCompany }>("/store/b2b/register", {
      method: "POST",
      body: {
        name: payload.company_name.trim(),
        email: payload.email.trim(),
        contact_name: payload.contact_name.trim(),
        verification_token: payload.verification_token,
        phone: payload.phone?.trim() || null,
        vat_number: payload.vat_number?.trim() || null,
        admin_notes: payload.message?.trim() || null,
      },
      headers,
    })
    .catch(medusaError)

  return company
}
