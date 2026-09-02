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
  resolveRegionDetails,
} from "../b2b/medusa-integrations"
import type {
  AdminOrderStats,
  AdminOrderSummary,
  ListAdminOrdersInput,
  ListAdminOrdersResult,
} from "./types"
import { assessOrderRisk } from "./order-risk"

type GraphOrder = {
  id: string
  display_id?: number | null
  status?: string | null
  email?: string | null
  created_at?: string | null
  updated_at?: string | null
  currency_code?: string | null
  total?: number | null
  payment_status?: string | null
  fulfillment_status?: string | null
  customer_id?: string | null
  metadata?: Record<string, unknown> | null
  customer?: {
    first_name?: string | null
    last_name?: string | null
  } | null
  items?: Array<{ quantity?: number | null }> | null
}

const ORDER_FIELDS = [
  "id",
  "display_id",
  "status",
  "email",
  "created_at",
  "updated_at",
  "currency_code",
  "total",
  "payment_status",
  "fulfillment_status",
  "metadata",
  "customer_id",
  "customer.first_name",
  "customer.last_name",
  "items.quantity",
]

function mapOrder(order: GraphOrder): AdminOrderSummary {
  const metadata = (order.metadata ?? {}) as Record<string, unknown>
  const customerName = [order.customer?.first_name, order.customer?.last_name]
    .filter(Boolean)
    .join(" ")

  const itemCount = (order.items ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  )

  const risk = assessOrderRisk({
    total: order.total,
    customer_id: order.customer_id,
    customer_order_count: 1,
    payment_status: order.payment_status,
    email: order.email,
    metadata,
  })

  const customerNotes =
    typeof metadata.customer_notes === "string" ? metadata.customer_notes : null

  return {
    id: order.id,
    display_id: order.display_id ?? 0,
    status: order.status ?? "unknown",
    email: order.email ?? null,
    customer_name: customerName || null,
    currency_code: order.currency_code ?? null,
    total: order.total ?? null,
    payment_status: order.payment_status ?? null,
    fulfillment_status: order.fulfillment_status ?? null,
    created_at: order.created_at ?? null,
    updated_at: order.updated_at ?? null,
    is_test_draft: metadata.supercore_test_draft === true,
    is_archived: metadata.supercore_archived === true,
    b2b_quote_id:
      typeof metadata.b2b_quote_id === "string" ? metadata.b2b_quote_id : null,
    item_count: itemCount,
    risk_level: risk.level,
    has_customer_notes: Boolean(customerNotes?.trim()),
  }
}

function buildStats(orders: AdminOrderSummary[]): AdminOrderStats {
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    completed: orders.filter((order) => order.status === "completed").length,
    canceled: orders.filter((order) => order.status === "canceled").length,
    requires_action: orders.filter(
      (order) => order.status === "requires_action"
    ).length,
    test_drafts: orders.filter((order) => order.is_test_draft).length,
    pending_fulfillment: orders.filter(
      (order) =>
        order.fulfillment_status &&
        !["fulfilled", "shipped", "delivered", "canceled"].includes(
          order.fulfillment_status
        )
    ).length,
    pending_payment: orders.filter(
      (order) =>
        order.payment_status &&
        !["captured", "paid", "refunded", "canceled"].includes(
          order.payment_status
        )
    ).length,
  }
}

function createEmptyStats(): AdminOrderStats {
  return {
    total: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
    requires_action: 0,
    test_drafts: 0,
    pending_fulfillment: 0,
    pending_payment: 0,
  }
}

function addOrderToStats(stats: AdminOrderStats, order: AdminOrderSummary) {
  const next = buildStats([order])

  for (const key of Object.keys(stats) as Array<keyof AdminOrderStats>) {
    stats[key] += next[key]
  }
}

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit)) {
    return 20
  }

  return Math.min(Math.max(Math.floor(limit ?? 20), 1), 100)
}

function normalizeOffset(offset: number | undefined) {
  if (!Number.isFinite(offset)) {
    return 0
  }

  return Math.max(Math.floor(offset ?? 0), 0)
}

function matchesSearch(order: AdminOrderSummary, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }

  return (
    order.email?.toLowerCase().includes(needle) ||
    order.customer_name?.toLowerCase().includes(needle) ||
    String(order.display_id).includes(needle) ||
    order.id.toLowerCase().includes(needle)
  )
}

async function scanOrders(
  scope: MedusaContainer,
  onOrder: (order: AdminOrderSummary) => void
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      pagination?: { skip?: number; take?: number; order?: Record<string, string> }
    }) => Promise<{ data: GraphOrder[] }>
  }

  const batchSize = 100
  let skip = 0

  while (true) {
    const { data } = await query.graph({
      entity: "order",
      fields: ORDER_FIELDS,
      pagination: {
        take: batchSize,
        skip,
        order: { created_at: "DESC" },
      },
    })

    for (const order of data) {
      onOrder(mapOrder(order))
    }

    if (data.length < batchSize) {
      return
    }

    skip += data.length
  }
}

export async function listAdminOrders(
  scope: MedusaContainer,
  input: ListAdminOrdersInput = {}
): Promise<ListAdminOrdersResult> {
  const limit = normalizeLimit(input.limit)
  const offset = normalizeOffset(input.offset)
  const page: AdminOrderSummary[] = []
  const stats = createEmptyStats()
  let count = 0

  await scanOrders(scope, (order) => {
    addOrderToStats(stats, order)

    if (input.status && input.status !== "all" && order.status !== input.status) {
      return
    }

    if (input.test_drafts_only && !order.is_test_draft) {
      return
    }

    if (input.archived_only ? !order.is_archived : order.is_archived) {
      return
    }

    if (!matchesSearch(order, input.q ?? "")) {
      return
    }

    if (count >= offset && page.length < limit) {
      page.push(order)
    }

    count += 1
  })

  return {
    orders: page,
    count,
    stats,
  }
}

async function resolveSampleVariant(scope: MedusaContainer) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      pagination?: { take?: number }
    }) => Promise<{
      data: Array<{
        id: string
        title?: string | null
        product?: { title?: string | null } | null
      }>
    }>
  }

  const { data } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "product.title"],
    pagination: { take: 1 },
  })

  return data[0] ?? null
}

export async function createDraftTestOrder(scope: MedusaContainer) {
  const regionId = await resolveFallbackRegionId(scope)
  const salesChannelId = await resolveDefaultSalesChannelId(scope)
  const variant = await resolveSampleVariant(scope)

  if (!regionId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No region configured. Seed store data first."
    )
  }

  if (!salesChannelId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No default sales channel configured."
    )
  }

  if (!variant) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No product variants found. Seed catalog data first."
    )
  }

  const region = await resolveRegionDetails(scope, regionId)

  if (!region) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Region ${regionId} was not found`
    )
  }

  const countryCode =
    region.countries?.[0]?.iso_2?.toLowerCase() ?? "gb"

  const { result: order } = await createOrderWorkflow(scope).run({
    input: {
      region_id: regionId,
      sales_channel_id: salesChannelId,
      email: "draft-test@supercore.local",
      currency_code: region.currency_code ?? "gbp",
      status: "pending",
      metadata: {
        supercore_test_draft: true,
        supercore_test_draft_note:
          "Draft order created from Orders management for admin testing.",
      },
      items: [
        {
          variant_id: variant.id,
          quantity: 1,
          title:
            variant.product?.title ??
            variant.title ??
            "Draft test line item",
          unit_price: 10000,
        },
      ],
      shipping_address: {
        first_name: "Draft",
        last_name: "Tester",
        company: "Supercore QA",
        address_1: "1 Test Lane",
        city: "London",
        country_code: countryCode,
        postal_code: "SW1A 1AA",
      },
    },
  })

  return mapOrder(order as GraphOrder)
}

export async function removeAdminOrder(
  scope: MedusaContainer,
  orderId: string
) {
  const orderModule = scope.resolve(Modules.ORDER) as {
    cancelOrder?: (orderId: string) => Promise<unknown>
    deleteOrders?: (ids: string[]) => Promise<unknown>
    softDeleteOrders?: (ids: string[]) => Promise<unknown>
    updateOrders?: (data: {
      id: string
      status?: string
      metadata?: Record<string, unknown>
    }) => Promise<unknown>
    retrieveOrder?: (id: string) => Promise<GraphOrder>
  }

  const order = await orderModule.retrieveOrder?.(orderId)

  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  }

  if (typeof orderModule.cancelOrder === "function") {
    await orderModule.cancelOrder(orderId)
    return { id: orderId, action: "canceled" as const }
  }

  if (typeof orderModule.softDeleteOrders === "function") {
    await orderModule.softDeleteOrders([orderId])
    return { id: orderId, action: "deleted" as const }
  }

  if (typeof orderModule.deleteOrders === "function") {
    await orderModule.deleteOrders([orderId])
    return { id: orderId, action: "deleted" as const }
  }

  if (typeof orderModule.updateOrders === "function") {
    await orderModule.updateOrders({
      id: orderId,
      status: "canceled",
      metadata: {
        ...((order.metadata as Record<string, unknown> | null) ?? {}),
        supercore_admin_removed: true,
        supercore_admin_removed_at: new Date().toISOString(),
      },
    })
    return { id: orderId, action: "canceled" as const }
  }

  throw new MedusaError(
    MedusaError.Types.NOT_ALLOWED,
    "Order removal is not supported by the order module"
  )
}
