import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateLineItemInCartWorkflow } from "@medusajs/medusa/core-flows"
import { B2B_MODULE } from "../../modules/b2b"
import B2bModuleService from "../../modules/b2b/service"
import { resolveCustomerGroupId } from "./customer-context"
import { resolveTierPriceDetails } from "./tier-pricing"
import { requireB2bFeature } from "./settings-guard"

type CartLineItem = {
  id: string
  variant_id?: string | null
  quantity?: number | null
  unit_price?: number | null
  metadata?: Record<string, unknown> | null
}

type CartRecord = {
  id: string
  customer_id?: string | null
  currency_code?: string | null
  items?: CartLineItem[]
}

export async function applyCartTierPricing(
  scope: MedusaContainer,
  cartId: string,
  customerId?: string | null
): Promise<{ cart_id: string; updated_items: number }> {
  await requireB2bFeature(scope, "tiered_pricing_enabled")

  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
      filters: Record<string, unknown>
    }) => Promise<{ data: CartRecord[] }>
  }

  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "customer_id",
      "currency_code",
      "items.id",
      "items.variant_id",
      "items.quantity",
      "items.unit_price",
      "items.metadata",
    ],
    filters: { id: cartId },
  })

  const cart = data[0]

  if (!cart) {
    throw new Error("Cart not found")
  }

  const resolvedCustomerId = customerId ?? cart.customer_id ?? null

  if (!resolvedCustomerId) {
    return { cart_id: cartId, updated_items: 0 }
  }

  const customerGroupId = await resolveCustomerGroupId(scope, resolvedCustomerId)
  const b2bService = scope.resolve(B2B_MODULE) as B2bModuleService
  let updatedItems = 0

  for (const item of cart.items ?? []) {
    if (!item.variant_id) {
      continue
    }

    const quantity = item.quantity ?? 1
    const metadata = (item.metadata ?? {}) as Record<string, unknown>
    const storedBase = metadata.b2b_base_unit_price
    const baseUnitPrice =
      typeof storedBase === "number"
        ? storedBase
        : item.unit_price ?? null

    const tier = await b2bService.resolveTierPrice({
      variant_id: item.variant_id,
      quantity,
      customer_group_id: customerGroupId,
      currency_code: cart.currency_code ?? undefined,
    })

    if (!tier && metadata.b2b_tier_id) {
      const restorePrice =
        typeof metadata.b2b_base_unit_price === "number"
          ? metadata.b2b_base_unit_price
          : baseUnitPrice

      if (restorePrice != null) {
        await updateLineItemInCartWorkflow(scope).run({
          input: {
            cart_id: cartId,
            item_id: item.id,
            update: {
              unit_price: restorePrice,
              is_custom_price: false,
              compare_at_unit_price: null,
              metadata: {
                ...metadata,
                b2b_tier_id: null,
                b2b_tier_name: null,
                b2b_base_unit_price: null,
              },
            },
          },
        })
        updatedItems += 1
      }

      continue
    }

    const resolved = resolveTierPriceDetails(tier, baseUnitPrice)

    if (resolved.unit_price == null || baseUnitPrice == null) {
      continue
    }

    if (Math.abs(resolved.unit_price - baseUnitPrice) < 0.0001) {
      continue
    }

    await updateLineItemInCartWorkflow(scope).run({
      input: {
        cart_id: cartId,
        item_id: item.id,
        update: {
          unit_price: resolved.unit_price,
          is_custom_price: true,
          compare_at_unit_price: baseUnitPrice,
          metadata: {
            ...(item.metadata ?? {}),
            b2b_tier_id: tier?.id ?? null,
            b2b_tier_name: tier?.name ?? null,
            b2b_base_unit_price: baseUnitPrice,
          },
        },
      },
    })

    updatedItems += 1
  }

  if (resolvedCustomerId && !cart.customer_id) {
    const cartModule = scope.resolve(Modules.CART) as {
      updateCarts: (data: {
        id: string
        customer_id: string
      }) => Promise<unknown>
    }

    await cartModule.updateCarts({
      id: cartId,
      customer_id: resolvedCustomerId,
    })
  }

  return { cart_id: cartId, updated_items: updatedItems }
}
