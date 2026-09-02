import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import {
  STRIPE_PROVIDER_ID,
  getStripeEnvConfig,
} from "./stripe-env"

type RegionRow = {
  id: string
  name?: string | null
  currency_code?: string | null
  payment_providers?: Array<string | { id?: string | null }> | null
}

export type RegionStripeStatus = {
  id: string
  name: string
  currency_code: string
  enabled: boolean
  payment_providers: string[]
}

function providerIds(region: RegionRow) {
  return (region.payment_providers ?? [])
    .map((provider) => (typeof provider === "string" ? provider : provider?.id))
    .filter((id): id is string => Boolean(id))
}

export async function isStripeProviderRegistered(scope: MedusaContainer) {
  try {
    const payment = scope.resolve(Modules.PAYMENT) as {
      listPaymentProviders: (
        filters?: { id?: string },
        config?: { take?: number }
      ) => Promise<Array<{ id?: string }>>
    }
    const providers = await payment.listPaymentProviders(
      { id: STRIPE_PROVIDER_ID },
      { take: 1 }
    )

    if (providers.some((provider) => provider.id === STRIPE_PROVIDER_ID)) {
      return true
    }

    const all = await payment.listPaymentProviders({}, { take: 50 })
    return all.some((provider) => provider.id === STRIPE_PROVIDER_ID)
  } catch {
    return false
  }
}

export async function listRegionStripeStatus(
  scope: MedusaContainer
): Promise<RegionStripeStatus[]> {
  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: {
      entity: string
      fields: string[]
    }) => Promise<{ data: RegionRow[] }>
  }

  const { data } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "payment_providers.id"],
  })

  return data.map((region) => {
    const ids = providerIds(region)

    return {
      id: region.id,
      name: region.name ?? region.id,
      currency_code: (region.currency_code ?? "").toUpperCase(),
      enabled: ids.includes(STRIPE_PROVIDER_ID),
      payment_providers: ids,
    }
  })
}

export async function enableStripeOnAllRegions(scope: MedusaContainer) {
  const config = getStripeEnvConfig()

  if (!config.configured) {
    throw new Error("Stripe is not configured with a valid secret key")
  }

  const registered = await isStripeProviderRegistered(scope)

  if (!registered) {
    throw new Error(
      "Stripe provider is not registered yet. Restart Medusa after setting STRIPE_API_KEY."
    )
  }

  const regions = await listRegionStripeStatus(scope)
  const pending = regions.filter((region) => !region.enabled)

  for (const region of pending) {
    const paymentProviders = Array.from(
      new Set([...region.payment_providers, STRIPE_PROVIDER_ID])
    )

    await updateRegionsWorkflow(scope).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: paymentProviders,
        },
      },
    })
  }

  return {
    updated: pending.length,
    regions: await listRegionStripeStatus(scope),
  }
}
