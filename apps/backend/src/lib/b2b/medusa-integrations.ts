import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createCustomerGroupsWorkflow,
  deleteCustomerGroupsWorkflow,
  linkCustomersToCustomerGroupWorkflow,
  updateCustomerGroupsWorkflow,
} from "@medusajs/medusa/core-flows"

export async function resolveTradeAccountGroupId(
  scope: { resolve: (key: string) => unknown }
): Promise<string | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ id: string }> }>
  }

  const { data } = await query.graph({
    entity: "customer_group",
    fields: ["id"],
    filters: { name: "Trade Account" },
  })

  return data[0]?.id ?? null
}

export type AdminCustomerGroup = {
  id: string
  name: string
  customer_count: number
  created_at?: string | null
}

export async function listMedusaCustomerGroups(
  scope: { resolve: (key: string) => unknown }
): Promise<AdminCustomerGroup[]> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
    }) => Promise<{
      data: Array<{
        id: string
        name?: string | null
        created_at?: string | null
        customers?: Array<{ id: string }> | null
      }>
    }>
  }

  const { data } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name", "created_at", "customers.id"],
  })

  return data
    .map((group) => ({
      id: group.id,
      name: group.name?.trim() || group.id,
      customer_count: group.customers?.length ?? 0,
      created_at: group.created_at ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function createMedusaCustomerGroup(
  scope: { resolve: (key: string) => unknown },
  name: string
) {
  const { result } = await createCustomerGroupsWorkflow(scope).run({
    input: {
      customersData: [{ name: name.trim() }],
    },
  })

  return result[0]
}

export async function updateMedusaCustomerGroup(
  scope: { resolve: (key: string) => unknown },
  id: string,
  name: string
) {
  await updateCustomerGroupsWorkflow(scope).run({
    input: {
      selector: { id },
      update: { name: name.trim() },
    },
  })
}

export async function deleteMedusaCustomerGroup(
  scope: { resolve: (key: string) => unknown },
  id: string
) {
  await deleteCustomerGroupsWorkflow(scope).run({
    input: { ids: [id] },
  })
}

export async function assignCustomerToGroup(
  scope: { resolve: (key: string) => unknown },
  customerId: string,
  customerGroupId: string
) {
  await linkCustomersToCustomerGroupWorkflow(scope).run({
    input: {
      id: customerGroupId,
      add: [customerId],
    },
  })
}

export async function linkCustomersToGroup(
  scope: { resolve: (key: string) => unknown },
  customerGroupId: string,
  input: { add?: string[]; remove?: string[] }
) {
  const add = [...new Set((input.add ?? []).filter(Boolean))]
  const remove = [...new Set((input.remove ?? []).filter(Boolean))]

  if (!add.length && !remove.length) {
    return
  }

  await linkCustomersToCustomerGroupWorkflow(scope).run({
    input: {
      id: customerGroupId,
      add,
      remove,
    },
  })
}

export async function resolveRegionCurrency(
  scope: { resolve: (key: string) => unknown },
  regionId?: string | null
): Promise<string | null> {
  if (!regionId) {
    return null
  }

  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ currency_code?: string }> }>
  }

  const { data } = await query.graph({
    entity: "region",
    fields: ["currency_code"],
    filters: { id: regionId },
  })

  return data[0]?.currency_code?.toLowerCase() ?? null
}

export async function resolveDefaultSalesChannelId(
  scope: { resolve: (key: string) => unknown }
): Promise<string | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ default_sales_channel_id?: string | null }> }>
  }

  const { data } = await query.graph({
    entity: "store",
    fields: ["default_sales_channel_id"],
    filters: {},
  })

  return data[0]?.default_sales_channel_id ?? null
}

export async function resolveFallbackRegionId(
  scope: { resolve: (key: string) => unknown }
): Promise<string | null> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: Array<{ id: string }> }>
  }

  const { data } = await query.graph({
    entity: "region",
    fields: ["id"],
    filters: {},
  })

  return data[0]?.id ?? null
}

export async function resolveRegionDetails(
  scope: { resolve: (key: string) => unknown },
  regionId: string
) {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{
      data: Array<{
        id: string
        currency_code?: string | null
        countries?: Array<{ iso_2?: string | null }> | null
      }>
    }>
  }

  const { data } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "countries.iso_2"],
    filters: { id: regionId },
  })

  return data[0] ?? null
}
