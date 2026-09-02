import type { MedusaContainer } from "@medusajs/framework/types"
import { getStripeEnvConfig } from "../lib/payments/stripe-env"
import { enableStripeOnAllRegions } from "../lib/payments/stripe-regions"

export default async function enableStripeRegionsJob(container: MedusaContainer) {
  const config = getStripeEnvConfig()

  if (!config.configured || !config.autoEnableRegions) {
    return
  }

  const logger = container.resolve("logger") as {
    info: (message: string) => void
    error: (message: string) => void
  }

  try {
    const result = await enableStripeOnAllRegions(container)

    if (result.updated) {
      logger.info(
        `[payments] Enabled Stripe on ${result.updated} region(s)`
      )
    }
  } catch (error) {
    logger.error(
      `[payments] Could not enable Stripe on regions: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config = {
  name: "enable-stripe-regions",
  schedule: "*/10 * * * *",
}
