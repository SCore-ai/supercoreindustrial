import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { resolveRegionDetails } from "../b2b/medusa-integrations"
import { getEmailRuntimeConfig } from "../b2b/settings-email"
import {
  AbandonedCheckoutDetail,
  AbandonedCheckoutMetadata,
  AbandonedCheckoutRecoveryEmailStatus,
  AbandonedCheckoutRecoveryStatus,
  AbandonedCheckoutSummary,
  ListAbandonedCheckoutsInput,
} from "./types"

type GraphCart = {
  id: string
  email?: string | null
  created_at?: string
  updated_at?: string
  completed_at?: string | null
  currency_code?: string | null
  total?: number | null
  item_subtotal?: number | null
  tax_total?: number | null
  shipping_subtotal?: number | null
  discount_subtotal?: number | null
  metadata?: Record<string, unknown> | null
  customer_id?: string | null
  region_id?: string | null
  customer?: {
    id?: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
    has_account?: boolean
  } | null
  region?: {
    id?: string
    name?: string | null
    countries?: Array<{ iso_2?: string | null; display_name?: string | null }> | null
  } | null
  shipping_address?: Record<string, string | null> | null
  billing_address?: Record<string, string | null> | null
  shipping_methods?: Array<{ name?: string | null; amount?: number | null }> | null
  items?: Array<{
    id: string
    quantity?: number | null
    unit_price?: number | null
    title?: string | null
    subtitle?: string | null
    thumbnail?: string | null
    variant?: { sku?: string | null; product?: { handle?: string | null } | null } | null
  }> | null
}

const CART_FIELDS = [
  "id",
  "email",
  "created_at",
  "updated_at",
  "completed_at",
  "currency_code",
  "total",
  "item_subtotal",
  "tax_total",
  "shipping_subtotal",
  "discount_subtotal",
  "metadata",
  "customer_id",
  "region_id",
  "customer.id",
  "customer.email",
  "customer.first_name",
  "customer.last_name",
  "customer.has_account",
  "region.id",
  "region.name",
  "region.countries.iso_2",
  "region.countries.display_name",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.postal_code",
  "shipping_address.province",
  "shipping_address.country_code",
  "shipping_address.phone",
  "billing_address.first_name",
  "billing_address.last_name",
  "billing_address.address_1",
  "billing_address.address_2",
  "billing_address.city",
  "billing_address.postal_code",
  "billing_address.province",
  "billing_address.country_code",
  "billing_address.phone",
  "shipping_methods.name",
  "shipping_methods.amount",
  "items.id",
  "items.quantity",
  "items.unit_price",
  "items.title",
  "items.subtitle",
  "items.thumbnail",
  "items.variant.sku",
  "items.variant.product.handle",
]

function parseMetadata(
  metadata: Record<string, unknown> | null | undefined
): AbandonedCheckoutMetadata {
  const raw = metadata?.abandoned_checkout

  if (!raw || typeof raw !== "object") {
    return {}
  }

  return raw as AbandonedCheckoutMetadata
}

function getRecoveryEmailStatus(
  meta: AbandonedCheckoutMetadata
): AbandonedCheckoutRecoveryEmailStatus {
  return meta.recovery_email?.status ?? "not_sent"
}

function getStorefrontUrl() {
  return process.env.STOREFRONT_URL?.trim() || "http://localhost:8000"
}

function displayCheckoutId(cartId: string) {
  return cartId.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase()
}

function getCustomerName(cart: GraphCart) {
  const shipping = cart.shipping_address
  const shippingName = [shipping?.first_name, shipping?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()

  if (shippingName) {
    return shippingName
  }

  const customerName = [cart.customer?.first_name, cart.customer?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()

  if (customerName) {
    return customerName
  }

  const email = cart.email || cart.customer?.email

  if (email) {
    return email.split("@")[0] || email
  }

  return "Guest checkout"
}

function getRegionLabel(cart: GraphCart) {
  const shippingCountry = cart.shipping_address?.country_code?.toUpperCase()
  const regionCountry = cart.region?.countries?.[0]?.display_name
  const regionName = cart.region?.name

  if (shippingCountry) {
    return shippingCountry
  }

  if (regionCountry) {
    return regionCountry
  }

  return regionName || "—"
}

function getCountryCode(cart: GraphCart) {
  return (
    cart.shipping_address?.country_code?.toLowerCase() ||
    cart.region?.countries?.[0]?.iso_2?.toLowerCase() ||
    "gb"
  )
}

function getRecoveryStatus(cart: GraphCart): AbandonedCheckoutRecoveryStatus {
  const meta = parseMetadata(cart.metadata)

  if (cart.completed_at || meta.recovery_status === "recovered" || meta.recovered_order_id) {
    return "recovered"
  }

  return "not_recovered"
}

function hasCheckoutActivity(cart: GraphCart) {
  const items = cart.items ?? []

  if (!items.length) {
    return false
  }

  return Boolean(
    cart.email ||
      cart.customer_id ||
      cart.shipping_address?.address_1 ||
      cart.shipping_address?.first_name ||
      cart.billing_address?.address_1
  )
}

function addressesMatch(cart: GraphCart) {
  const shipping = cart.shipping_address
  const billing = cart.billing_address

  if (!shipping?.address_1 || !billing?.address_1) {
    return !billing?.address_1
  }

  return (
    shipping.address_1 === billing.address_1 &&
    shipping.postal_code === billing.postal_code &&
    shipping.city === billing.city
  )
}

async function buildCheckoutUrl(scope: MedusaContainer, cart: GraphCart) {
  const countryCode = getCountryCode(cart)
  const base = getStorefrontUrl().replace(/\/$/, "")

  if (cart.region_id) {
    const region = await resolveRegionDetails(scope, cart.region_id)
    const iso = region?.countries?.[0]?.iso_2?.toLowerCase()

    if (iso) {
      return `${base}/${iso}/checkout`
    }
  }

  return `${base}/${countryCode}/checkout`
}

function mapLineItems(cart: GraphCart) {
  return (cart.items ?? []).map((item) => {
    const quantity = item.quantity ?? 1
    const unitPrice = item.unit_price ?? 0

    return {
      id: item.id,
      title: item.title ?? "Line item",
      subtitle: item.subtitle ?? null,
      thumbnail: item.thumbnail ?? null,
      quantity,
      unit_price: unitPrice,
      sku: item.variant?.sku ?? null,
      product_handle: item.variant?.product?.handle ?? null,
      line_total: unitPrice * quantity,
    }
  })
}

function mapSummary(cart: GraphCart): AbandonedCheckoutSummary {
  const items = cart.items ?? []
  const currency = cart.currency_code?.toLowerCase() || "gbp"
  const total =
    cart.total ??
    (cart.item_subtotal ?? 0) +
      (cart.shipping_subtotal ?? 0) +
      (cart.tax_total ?? 0) -
      (cart.discount_subtotal ?? 0)

  return {
    id: cart.id,
    display_id: displayCheckoutId(cart.id),
    created_at: cart.created_at ?? new Date().toISOString(),
    updated_at: cart.updated_at ?? cart.created_at ?? new Date().toISOString(),
    customer_name: getCustomerName(cart),
    customer_email: cart.email || cart.customer?.email || null,
    region_label: getRegionLabel(cart),
    country_code: getCountryCode(cart),
    recovery_status: getRecoveryStatus(cart),
    recovery_email_status: getRecoveryEmailStatus(parseMetadata(cart.metadata)),
    currency_code: currency,
    total,
    item_count: items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
  }
}

async function mapDetail(
  scope: MedusaContainer,
  cart: GraphCart
): Promise<AbandonedCheckoutDetail> {
  const summary = mapSummary(cart)
  const meta = parseMetadata(cart.metadata)
  const items = mapLineItems(cart)
  const b2bService: B2bModuleService = scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const emailConfigured = getEmailRuntimeConfig(settings).enabled

  return {
    ...summary,
    checkout_url: await buildCheckoutUrl(scope, cart),
    email: cart.email || cart.customer?.email || null,
    customer_id: cart.customer_id ?? cart.customer?.id ?? null,
    has_account: Boolean(cart.customer?.has_account),
    admin_notes: meta.admin_notes ?? null,
    recovered_order_id: meta.recovered_order_id ?? null,
    recovery_email_status: getRecoveryEmailStatus(meta),
    recovery_email_sent_at: meta.recovery_email?.sent_at ?? null,
    recovery_email_sent_to: meta.recovery_email?.sent_to ?? null,
    recovery_email_error: meta.recovery_email?.last_error ?? null,
    email_configured: emailConfigured,
    shipping_method: cart.shipping_methods?.[0]?.name ?? null,
    shipping_address: cart.shipping_address ?? null,
    billing_address: cart.billing_address ?? null,
    billing_same_as_shipping: addressesMatch(cart),
    items,
    item_subtotal: cart.item_subtotal ?? items.reduce((sum, item) => sum + item.line_total, 0),
    shipping_subtotal: cart.shipping_subtotal ?? cart.shipping_methods?.[0]?.amount ?? 0,
    tax_total: cart.tax_total ?? 0,
    discount_subtotal: cart.discount_subtotal ?? 0,
    total: summary.total,
  }
}

async function scanAbandonedCarts(
  scope: MedusaContainer,
  onCart: (cart: GraphCart) => void
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
      pagination?: {
        skip?: number
        take?: number
        order?: Record<string, string>
      }
    }) => Promise<{ data: GraphCart[] }>
  }

  const batchSize = 100
  let skip = 0

  while (true) {
    const { data } = await query.graph({
      entity: "cart",
      fields: CART_FIELDS,
      filters: {
        completed_at: null,
      },
      pagination: {
        skip,
        take: batchSize,
        order: { updated_at: "DESC" },
      },
    })

    for (const cart of data) {
      if (hasCheckoutActivity(cart)) {
        onCart(cart)
      }
    }

    if (data.length < batchSize) {
      return
    }

    skip += data.length
  }
}

function normalizeListLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) {
    return 20
  }

  return Math.min(Math.max(Math.floor(limit ?? 20), 1), 100)
}

function normalizeListOffset(offset: number | undefined) {
  if (!Number.isFinite(offset)) {
    return 0
  }

  return Math.max(Math.floor(offset ?? 0), 0)
}

function matchesSearch(cart: GraphCart, q?: string) {
  if (!q?.trim()) {
    return true
  }

  const needle = q.trim().toLowerCase()
  const haystack = [
    cart.id,
    displayCheckoutId(cart.id),
    cart.email,
    cart.customer?.email,
    cart.customer?.first_name,
    cart.customer?.last_name,
    cart.shipping_address?.first_name,
    cart.shipping_address?.last_name,
    getCustomerName(cart),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(needle)
}

export async function listAbandonedCheckouts(
  scope: MedusaContainer,
  input: ListAbandonedCheckoutsInput = {}
) {
  const limit = normalizeListLimit(input.limit)
  const offset = normalizeListOffset(input.offset)
  const checkouts: AbandonedCheckoutSummary[] = []
  let count = 0

  await scanAbandonedCarts(scope, (cart) => {
    const status = getRecoveryStatus(cart)

    if (input.recovery_status && input.recovery_status !== "all") {
      if (status !== input.recovery_status) {
        return
      }
    }

    if (!matchesSearch(cart, input.q)) {
      return
    }

    if (count >= offset && checkouts.length < limit) {
      checkouts.push(mapSummary(cart))
    }

    count += 1
  })

  return {
    checkouts,
    limit,
    offset,
  }
}

export async function retrieveAbandonedCheckout(
  scope: MedusaContainer,
  cartId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: GraphCart[] }>
  }

  const { data } = await query.graph({
    entity: "cart",
    fields: CART_FIELDS,
    filters: { id: cartId },
  })

  const cart = data[0]

  if (!cart || !hasCheckoutActivity(cart)) {
    return null
  }

  return mapDetail(scope, cart)
}

export async function updateAbandonedCheckoutMetadata(
  scope: MedusaContainer,
  cartId: string,
  patch: Partial<AbandonedCheckoutMetadata>
) {
  const cartModule = scope.resolve(Modules.CART) as {
    retrieveCart: (id: string) => Promise<{ metadata?: Record<string, unknown> | null }>
    updateCarts: (data: {
      id: string
      metadata: Record<string, unknown>
    }) => Promise<unknown>
  }

  const existing = await cartModule.retrieveCart(cartId)
  const currentMeta = parseMetadata(existing.metadata ?? null)

  await cartModule.updateCarts({
    id: cartId,
    metadata: {
      ...(existing.metadata ?? {}),
      abandoned_checkout: {
        ...currentMeta,
        ...patch,
        ...(patch.recovery_email && {
          recovery_email: {
            ...currentMeta.recovery_email,
            ...patch.recovery_email,
          },
        }),
      },
    },
  })
}

export async function updateAbandonedCheckoutNotes(
  scope: MedusaContainer,
  cartId: string,
  adminNotes: string | null
) {
  await updateAbandonedCheckoutMetadata(scope, cartId, {
    admin_notes: adminNotes,
  })

  return retrieveAbandonedCheckout(scope, cartId)
}
