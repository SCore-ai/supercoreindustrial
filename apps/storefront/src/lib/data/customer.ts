"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { FetchError } from "@medusajs/js-sdk"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  getMfaHeaders,
  getPendingCustomer,
  removeAuthToken,
  removeCartId,
  removeMfaToken,
  removePendingCustomer,
  setAuthToken,
  setMfaToken,
  setPendingCustomer,
} from "./cookies"

export type StoreAuthOptions = {
  storefront_mfa_required: boolean
  sso_enabled: boolean
  sso_provider: "saml" | "oauth" | "oidc" | null
  sso_auth_provider: string | null
  sso_authorize_url: string | null
}

export type CustomerAuthState =
  | { state: "error"; error: string }
  | { state: "verification_required"; email: string }
  | { state: "mfa_required"; email: string; error?: string }
  | { state: "success" }
  | null

// Requests a verification email for the given customer. The request must be
// authenticated with a token tied to the auth identity (the token returned by
// register or by a login that requires verification).
async function requestVerificationEmail(email: string, token: string) {
  await sdk.auth.verification.request(
    {
      entity_id: email,
      entity_type: "email",
    },
    {
      authorization: `Bearer ${token}`,
    }
  )
}

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password,
    })
  } catch (error) {
    const fetchError = error as FetchError
    // An existing identity (for example, an admin user with the same email) is
    // expected and handled: the customer can still log in to link a customer
    // record. Any other error is surfaced.
    if (
      fetchError.statusText !== "Unauthorized" ||
      fetchError.message !== "Identity with email already exists"
    ) {
      return { state: "error", error: String(error) }
    }
  }

  // Persist the extra signup fields. The customer record is created during
  // login, which is deferred until after email verification when the backend
  // requires it.
  await setPendingCustomer(customerForm)

  // Continue by logging in. The login response tells us whether the backend
  // requires email verification — we don't need a storefront-side flag.
  return completeLogin(customerForm.email, password)
}

export async function login(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  return completeLogin(email, password)
}

// Logs the customer in and reconciles the customer record. The behavior is
// driven entirely by the backend's login response, so it works whether or not
// email verification is enabled.
async function completeLogin(
  email: string,
  password: string
): Promise<CustomerAuthState> {
  let result: Awaited<ReturnType<typeof sdk.auth.login>>

  try {
    result = await sdk.auth.login("customer", "emailpass", { email, password })
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  // A `location` is returned by third-party auth providers, which this flow
  // doesn't support.
  if (typeof result === "object" && "location" in result) {
    return {
      state: "error",
      error: "This login method isn't supported by the storefront.",
    }
  }

  // The backend requires email verification and the customer hasn't verified
  // yet. Send the verification email and ask them to check their inbox.
  if (
    typeof result === "object" &&
    "verification_required" in result &&
    result.verification_required
  ) {
    try {
      await requestVerificationEmail(email, result.token)
    } catch {
      // Ignore: the customer can resend from the verification page.
    }
    return { state: "verification_required", email }
  }

  if (typeof result !== "string") {
    return {
      state: "error",
      error: "Authentication requires additional steps that aren't supported.",
    }
  }

  let token = result

  // The token may not be tied to a customer record yet — right after
  // registration, or after verifying a brand-new account. Ask the backend:
  // `/store/customers/me` rejects tokens without a registered actor, so a
  // failed retrieve means we still need to create the customer, then log in
  // again to obtain a customer-bound token.
  const customerExists = await sdk.store.customer
    .retrieve({}, { authorization: `Bearer ${token}` })
    .then(() => true)
    .catch(() => false)

  if (!customerExists) {
    const pending = await getPendingCustomer()

    try {
      await sdk.store.customer.create(
        {
          email,
          first_name: pending?.first_name,
          last_name: pending?.last_name,
          phone: pending?.phone,
        },
        {},
        { authorization: `Bearer ${token}` }
      )

      token = (await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      })) as string
    } catch (error) {
      return { state: "error", error: String(error) }
    }

    await removePendingCustomer()
  }

  return finalizeCustomerSession(token, email)
}

async function requestMfaChallenge(token: string) {
  return sdk.client.fetch<{
    required: boolean
    email?: string
    message?: string
  }>("/store/b2b/mfa/challenge", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  })
}

async function finalizeCustomerSession(
  token: string,
  email: string
): Promise<CustomerAuthState> {
  try {
    const challenge = await requestMfaChallenge(token)

    if (challenge.required) {
      await setMfaToken(token)
      await removeAuthToken()
      return {
        state: "mfa_required",
        email: challenge.email ?? email,
      }
    }
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  await setAuthToken(token)
  await removeMfaToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

export async function getStoreAuthOptions(): Promise<StoreAuthOptions | null> {
  return sdk.client
    .fetch<{ auth: StoreAuthOptions }>("/store/b2b/auth-options", {
      method: "GET",
      cache: "no-store",
    })
    .then(({ auth }) => auth)
    .catch(() => null)
}

export async function verifyMfaLogin(
  _currentState: unknown,
  formData: FormData
): Promise<CustomerAuthState> {
  const code = (formData.get("code") as string | null)?.trim() ?? ""
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const headers = await getMfaHeaders()

  if (!headers.authorization) {
    return {
      state: "error",
      error: "Your sign-in session expired. Sign in again.",
    }
  }

  if (!code) {
    return { state: "mfa_required", email }
  }

  try {
    await sdk.client.fetch("/store/b2b/mfa/verify", {
      method: "POST",
      headers,
      body: { code },
      cache: "no-store",
    })
  } catch (error) {
    return {
      state: "mfa_required",
      email,
      error:
        error instanceof Error
          ? error.message
          : "Invalid or expired verification code.",
    }
  }

  const token = headers.authorization.replace(/^Bearer\s+/i, "")
  await setAuthToken(token)
  await removeMfaToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  try {
    await transferCart()
  } catch (error) {
    return { state: "error", error: String(error) }
  }

  return { state: "success" }
}

export async function resendMfaCode(): Promise<CustomerAuthState> {
  const headers = await getMfaHeaders()

  if (!headers.authorization) {
    return {
      state: "error",
      error: "Your sign-in session expired. Sign in again.",
    }
  }

  try {
    const challenge = await sdk.client.fetch<{
      required: boolean
      email?: string
    }>("/store/b2b/mfa/challenge", {
      method: "POST",
      headers,
      cache: "no-store",
    })

    return {
      state: "mfa_required",
      email: challenge.email ?? "",
    }
  } catch (error) {
    return { state: "error", error: String(error) }
  }
}

export async function startSsoLogin(
  _currentState?: CustomerAuthState,
  _formData?: FormData
): Promise<CustomerAuthState> {
  const options = await getStoreAuthOptions()

  if (!options?.sso_enabled) {
    return { state: "error", error: "SSO is not enabled for this store." }
  }

  const provider = options.sso_auth_provider

  if (provider) {
    try {
      const result = await sdk.auth.login("customer", provider, {})

      if (typeof result === "object" && result && "location" in result) {
        redirect((result as { location: string }).location)
      }

      if (typeof result === "string") {
        return finalizeCustomerSession(result, "")
      }
    } catch (error) {
      if (!options.sso_authorize_url) {
        return { state: "error", error: String(error) }
      }
    }
  }

  if (options.sso_authorize_url) {
    redirect(options.sso_authorize_url)
  }

  return {
    state: "error",
    error:
      "SSO is enabled but SSO_AUTH_PROVIDER / SSO_ISSUER is not configured.",
  }
}

export async function completeSsoCallback(
  params: Record<string, string | string[] | undefined>
): Promise<CustomerAuthState> {
  const options = await getStoreAuthOptions()
  const provider = options?.sso_auth_provider

  if (!provider) {
    return {
      state: "error",
      error:
        "SSO callback received but SSO_AUTH_PROVIDER is not configured. Sign in with email and password.",
    }
  }

  const query: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) {
      query[key] = value
    } else if (Array.isArray(value) && value[0]) {
      query[key] = value[0]
    }
  }

  try {
    const token = await sdk.auth.callback("customer", provider, query)

    if (typeof token !== "string") {
      return {
        state: "error",
        error: "SSO did not complete. Sign in with email and password.",
      }
    }

    const customerExists = await sdk.store.customer
      .retrieve({}, { authorization: `Bearer ${token}` })
      .then(() => true)
      .catch(() => false)

    if (!customerExists) {
      return {
        state: "error",
        error:
          "SSO succeeded but no store account exists for this identity. Register a trade account first.",
      }
    }

    return finalizeCustomerSession(token, "")
  } catch (error) {
    return { state: "error", error: String(error) }
  }
}

// Confirms a customer's email using the token from the verification link.
//
// The confirm route doesn't require authentication, so this works even when the
// customer opens the link on a different device than the one they signed up on.
export async function confirmEmailVerification(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await sdk.auth.verification.confirm({ code: token })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export type ResetPasswordState =
  | { state: "error"; error: string }
  | { state: "success" }
  | null

export type RequestPasswordResetState =
  | { state: "error"; error: string }
  | { state: "success"; email: string }
  | null

export async function requestPasswordReset(
  _currentState: unknown,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase()

  if (!email) {
    return { state: "error", error: "Enter the email for your account." }
  }

  try {
    await sdk.auth.resetPassword("customer", "emailpass", {
      identifier: email,
    })
  } catch {
    // Always succeed from the UI so we do not leak whether the email exists.
  }

  return { state: "success", email }
}

export async function resetPasswordWithToken(
  _currentState: unknown,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirm_password") as string

  if (!token?.trim() || !email?.trim()) {
    return { state: "error", error: "This reset link is invalid or expired." }
  }

  if (!password || password.length < 8) {
    return {
      state: "error",
      error: "Password must be at least 8 characters.",
    }
  }

  if (password !== confirmPassword) {
    return { state: "error", error: "Passwords do not match." }
  }

  try {
    await sdk.auth.updateProvider(
      "customer",
      "emailpass",
      {
        email: email.trim(),
        password,
      },
      token.trim()
    )
  } catch (error) {
    return {
      state: "error",
      error:
        error instanceof Error
          ? error.message
          : "Could not set password. The link may have expired.",
    }
  }

  return { state: "success" }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()
  await removeMfaToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<{ success: boolean; error: string | null }> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}
