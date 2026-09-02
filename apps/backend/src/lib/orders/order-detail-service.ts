import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createOrderWorkflow } from "@medusajs/medusa/core-flows"
import {
  resolveDefaultSalesChannelId,
  resolveFallbackRegionId,
} from "../b2b/medusa-integrations"
import { addressesMatch } from "./order-address"
import { assessOrderRisk } from "./order-risk"
import type {
  AdminOrderDetail,
  AdminOrderLineItem,
  OrderAddressRecord,
  UpdateAdminOrderInput,
} from "./types"

type GraphOrderDetail = {
  id: string
  display_id?: number | null
  status?: string | null
  email?: string | null
  created_at?: string | null
  updated_at?: string | null
  currency_code?: string | null
  total?: number | null
  subtotal?: number | null
  shipping_total?: number | null
  tax_total?: number | null
  discount_total?: number | null
  payment_status?: string | null
  fulfillment_status?: string | null
  customer_id?: string | null
  region_id?: string | null
  sales_channel_id?: string | null
  metadata?: Record<string, unknown> | null
  customer?: {
    id?: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
    phone?: string | null
    has_account?: boolean
    created_at?: string | null
  } | null
  shipping_address?: OrderAddressRecord | null
  billing_address?: OrderAddressRecord | null
  items?: Array<{
    id: string
    title?: string | null
    subtitle?: string | null
    thumbnail?: string | null
    quantity?: number | null
    unit_price?: number | null
    total?: number | null
    variant?: {
      sku?: string | null
      product?: { title?: string | null } | null
    } | null
  }> | null
  sales_channel?: { name?: string | null } | null
}

const DETAIL_FIELDS = [
  "id",
  "display_id",
  "status",
  "email",
  "created_at",
  "updated_at",
  "currency_code",
  "total",
  "subtotal",
  "shipping_total",
  "tax_total",
  "discount_total",
  "payment_status",
  "fulfillment_status",
  "customer_id",
  "region_id",
  "sales_channel_id",
  "metadata",
  "customer.id",
  "customer.email",
  "customer.first_name",
  "customer.last_name",
  "customer.phone",
  "customer.has_account",
  "customer.created_at",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "shipping_address.company",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.province",
  "shipping_address.postal_code",
  "shipping_address.country_code",
  "shipping_address.phone",
  "billing_address.first_name",
  "billing_address.last_name",
  "billing_address.company",
  "billing_address.address_1",
  "billing_address.address_2",
  "billing_address.city",
  "billing_address.province",
  "billing_address.postal_code",
  "billing_address.country_code",
  "billing_address.phone",
  "items.id",
  "items.title",
  "items.subtitle",
  "items.thumbnail",
  "items.quantity",
  "items.unit_price",
  "items.total",
  "items.variant.sku",
  "items.variant.product.title",
  "sales_channel.name",
]

async function countCustomerOrders(
  scope: MedusaContainer,
  customerId?: string | null,
  email?: string | null
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters?: Record<string, unknown>
      pagination?: { take?: number }
    }) => Promise<{ data: Array<{ id: string; created_at?: string | null }> }>
  }

  if (customerId) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "created_at"],
      filters: { customer_id: customerId },
      pagination: { take: 200 },
    })
    return data
  }

  if (email) {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "created_at"],
      filters: { email },
      pagination: { take: 200 },
    })
    return data
  }

  return []
}

function mapLineItems(items?: GraphOrderDetail["items"]): AdminOrderLineItem[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title ?? item.variant?.product?.title ?? "Item",
    subtitle: item.subtitle ?? item.variant?.sku ?? null,
    thumbnail: item.thumbnail ?? null,
    quantity: item.quantity ?? 0,
    unit_price: item.unit_price ?? null,
    total: item.total ?? null,
    sku: item.variant?.sku ?? null,
  }))
}

function buildConversionSummary(
  customerOrders: Array<{ id: string; created_at?: string | null }>,
  currentOrderId: string,
  metadata: Record<string, unknown>
) {
  const sorted = [...customerOrders].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return aTime - bTime
  })

  const orderIndex = sorted.findIndex((entry) => entry.id === currentOrderId)
  const orderNumber = orderIndex >= 0 ? orderIndex + 1 : sorted.length

  const firstSessionSource =
    typeof metadata.conversion_first_session === "string"
      ? metadata.conversion_first_session
      : typeof metadata.utm_source === "string"
        ? metadata.utm_source
        : "direct to your store"

  const sessionCount =
    typeof metadata.conversion_session_count === "number"
      ? metadata.conversion_session_count
      : 1

  const sessionDays =
    typeof metadata.conversion_session_days === "number"
      ? metadata.conversion_session_days
      : 1

  return {
    customer_order_count: sorted.length,
    order_number_for_customer: orderNumber,
    first_session_source: firstSessionSource,
    session_count: sessionCount,
    session_days: sessionDays,
    summary_lines: [
      `This is their ${orderNumber}${orderNumber === 1 ? "st" : orderNumber === 2 ? "nd" : orderNumber === 3 ? "rd" : "th"} order`,
      `1st session was ${firstSessionSource}`,
      `${sessionCount} session${sessionCount === 1 ? "" : "s"} over ${sessionDays} day${sessionDays === 1 ? "" : "s"}`,
    ],
  }
}

export async function retrieveAdminOrderDetail(
  scope: MedusaContainer,
  orderId: string
): Promise<AdminOrderDetail> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: GraphOrderDetail[] }>
  }

  const { data } = await query.graph({
    entity: "order",
    fields: DETAIL_FIELDS,
    filters: { id: orderId },
  })

  const order = data[0]

  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  }

  const metadata = (order.metadata ?? {}) as Record<string, unknown>
  const customerOrders = await countCustomerOrders(
    scope,
    order.customer_id,
    order.email
  )

  const customerName = [
    order.customer?.first_name ?? order.shipping_address?.first_name,
    order.customer?.last_name ?? order.shipping_address?.last_name,
  ]
    .filter(Boolean)
    .join(" ")

  const customerNotes =
    typeof metadata.customer_notes === "string" ? metadata.customer_notes : null

  const billingSameAsShipping = addressesMatch(
    order.shipping_address,
    order.billing_address
  )

  const risk = assessOrderRisk({
    total: order.total,
    customer_id: order.customer_id,
    customer_order_count: customerOrders.length,
    payment_status: order.payment_status,
    email: order.email,
    metadata,
  })

  const conversion = buildConversionSummary(
    customerOrders,
    order.id,
    metadata
  )

  const createdAt = order.created_at
  const source =
    typeof metadata.order_source === "string"
      ? metadata.order_source
      : order.sales_channel?.name ?? "Online Store"

  return {
    id: order.id,
    display_id: order.display_id ?? 0,
    status: order.status ?? "unknown",
    email: order.email ?? order.customer?.email ?? null,
    customer_id: order.customer_id ?? null,
    customer_name: customerName || null,
    customer_order_count: customerOrders.length,
    currency_code: order.currency_code ?? null,
    total: order.total ?? null,
    subtotal: order.subtotal ?? null,
    shipping_total: order.shipping_total ?? null,
    tax_total: order.tax_total ?? null,
    discount_total: order.discount_total ?? null,
    payment_status: order.payment_status ?? null,
    fulfillment_status: order.fulfillment_status ?? null,
    created_at: order.created_at ?? null,
    updated_at: order.updated_at ?? null,
    source,
    created_at_label: createdAt
      ? `${new Date(createdAt).toLocaleString()} from ${source}`
      : null,
    is_test_draft: metadata.supercore_test_draft === true,
    is_archived: metadata.supercore_archived === true,
    b2b_quote_id:
      typeof metadata.b2b_quote_id === "string" ? metadata.b2b_quote_id : null,
    customer_notes: customerNotes,
    shipping_address: order.shipping_address ?? null,
    billing_address: order.billing_address ?? null,
    billing_same_as_shipping: billingSameAsShipping,
    items: mapLineItems(order.items),
    item_count: (order.items ?? []).reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0
    ),
    risk,
    conversion,
    tags: Array.isArray(metadata.tags)
      ? metadata.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
  }
}

function getOrderModule(scope: MedusaContainer) {
  return scope.resolve(Modules.ORDER) as {
    updateOrders: (data: Record<string, unknown>) => Promise<GraphOrderDetail>
    cancelOrder?: (orderId: string) => Promise<unknown>
  }
}

export async function updateAdminOrder(
  scope: MedusaContainer,
  orderId: string,
  input: UpdateAdminOrderInput
) {
  const existing = await retrieveAdminOrderDetail(scope, orderId)
  const orderModule = getOrderModule(scope)
  const metadata = {
    ...(existing.customer_notes
      ? { customer_notes: existing.customer_notes }
      : {}),
    ...(existing.is_archived ? { supercore_archived: true } : {}),
  } as Record<string, unknown>

  if (input.customer_notes !== undefined) {
    metadata.customer_notes = input.customer_notes
  }

  if (input.tags !== undefined) {
    metadata.tags = input.tags
  }

  const payload: Record<string, unknown> = {
    id: orderId,
    metadata,
  }

  if (input.email !== undefined) {
    payload.email = input.email
  }

  if (input.shipping_address !== undefined) {
    payload.shipping_address = input.shipping_address
  }

  if (input.billing_address !== undefined) {
    payload.billing_address = input.billing_address
  }

  if (input.billing_same_as_shipping && input.shipping_address) {
    payload.billing_address = input.shipping_address
  }

  await orderModule.updateOrders(payload)

  return retrieveAdminOrderDetail(scope, orderId)
}

export async function removeOrderCustomer(
  scope: MedusaContainer,
  orderId: string
) {
  const orderModule = getOrderModule(scope)
  const detail = await retrieveAdminOrderDetail(scope, orderId)

  await orderModule.updateOrders({
    id: orderId,
    customer_id: null,
    metadata: {
      customer_notes: detail.customer_notes,
      supercore_archived: detail.is_archived || undefined,
      supercore_customer_removed_at: new Date().toISOString(),
      supercore_previous_customer_id: detail.customer_id,
    },
  })

  return retrieveAdminOrderDetail(scope, orderId)
}

export async function archiveAdminOrder(
  scope: MedusaContainer,
  orderId: string
) {
  const orderModule = getOrderModule(scope)
  const detail = await retrieveAdminOrderDetail(scope, orderId)

  await orderModule.updateOrders({
    id: orderId,
    status: "archived",
    metadata: {
      ...((detail.customer_notes ? { customer_notes: detail.customer_notes } : {})),
      supercore_archived: true,
      supercore_archived_at: new Date().toISOString(),
    },
  })

  return retrieveAdminOrderDetail(scope, orderId)
}

export async function duplicateAdminOrder(
  scope: MedusaContainer,
  orderId: string
) {
  const source = await retrieveAdminOrderDetail(scope, orderId)
  const regionId = await resolveFallbackRegionId(scope)
  const salesChannelId = await resolveDefaultSalesChannelId(scope)

  if (!regionId || !salesChannelId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Region and sales channel are required to duplicate an order"
    )
  }

  if (!source.items.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Cannot duplicate an order without line items"
    )
  }

  const { result: order } = await createOrderWorkflow(scope).run({
    input: {
      region_id: regionId,
      sales_channel_id: salesChannelId,
      customer_id: source.customer_id ?? undefined,
      email: source.email ?? undefined,
      currency_code: source.currency_code ?? undefined,
      status: "pending",
      metadata: {
        supercore_duplicated_from: source.id,
        supercore_duplicated_at: new Date().toISOString(),
        customer_notes: source.customer_notes,
      },
      items: source.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price ?? 0,
      })),
      shipping_address: source.shipping_address ?? undefined,
      billing_address: source.billing_address ?? undefined,
    },
  })

  return retrieveAdminOrderDetail(scope, (order as { id: string }).id)
}

export async function cancelAdminOrder(scope: MedusaContainer, orderId: string) {
  const orderModule = getOrderModule(scope)

  if (typeof orderModule.cancelOrder === "function") {
    await orderModule.cancelOrder(orderId)
  } else {
    await orderModule.updateOrders({
      id: orderId,
      status: "canceled",
      metadata: {
        supercore_canceled_at: new Date().toISOString(),
      },
    })
  }

  return retrieveAdminOrderDetail(scope, orderId)
}
