import "server-only"
import { cookies as nextCookies } from "next/headers"
import {
  medusaCookieOptions,
  medusaHttpOnlyCookieOptions,
} from "@lib/cookie-options"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | Record<string, never>
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | Record<string, never>> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", token, {
    ...medusaHttpOnlyCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export const setMfaToken = async (token: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_mfa", token, {
    ...medusaHttpOnlyCookieOptions,
    maxAge: 60 * 10,
  })
}

export const getMfaHeaders = async (): Promise<
  { authorization: string } | Record<string, never>
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_mfa")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

export const removeMfaToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_mfa", "", {
    ...medusaHttpOnlyCookieOptions,
    maxAge: -1,
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_jwt", "", {
    ...medusaHttpOnlyCookieOptions,
    maxAge: -1,
  })
}

export type PendingCustomer = {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
}

// During the email verification flow the customer record isn't created until
// the customer verifies their email and logs in. We temporarily persist the
// extra signup fields in a cookie so they survive the customer leaving to open
// their inbox, and read them back when creating the customer at login.
export const setPendingCustomer = async (customer: PendingCustomer) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_pending_customer", JSON.stringify(customer), {
    ...medusaHttpOnlyCookieOptions,
    maxAge: 60 * 60 * 24,
  })
}

export const getPendingCustomer = async (): Promise<PendingCustomer | null> => {
  const cookies = await nextCookies()
  const value = cookies.get("_medusa_pending_customer")?.value

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as PendingCustomer
  } catch {
    return null
  }
}

export const removePendingCustomer = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_pending_customer", "", {
    ...medusaHttpOnlyCookieOptions,
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", cartId, {
    ...medusaHttpOnlyCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_cart_id", "", {
    ...medusaHttpOnlyCookieOptions,
    maxAge: -1,
  })
}

export const getQuoteId = async () => {
  const cookies = await nextCookies()
  return cookies.get("_medusa_quote_id")?.value
}

export const setQuoteId = async (quoteId: string) => {
  const cookies = await nextCookies()
  cookies.set("_medusa_quote_id", quoteId, {
    ...medusaHttpOnlyCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  })
}

export const removeQuoteId = async () => {
  const cookies = await nextCookies()
  cookies.set("_medusa_quote_id", "", {
    ...medusaHttpOnlyCookieOptions,
    maxAge: -1,
  })
}
