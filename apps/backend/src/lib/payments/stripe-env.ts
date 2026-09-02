export const STRIPE_PROVIDER_ID = "pp_stripe_stripe"
export const STRIPE_PROVIDER_CONFIG_ID = "stripe"
export const STRIPE_WEBHOOK_PATH = "/hooks/payment/stripe_stripe"

export const STRIPE_WEBHOOK_EVENTS = [
  "payment_intent.amount_capturable_updated",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.partially_funded",
] as const

const SECRET_PREFIXES = ["sk_test_", "sk_live_", "rk_test_", "rk_live_"] as const
const MIN_KEY_LENGTH = 20

function keyMode(value: string): "test" | "live" | null {
  if (value.includes("_live_")) {
    return "live"
  }

  if (value.includes("_test_")) {
    return "test"
  }

  return null
}

export function isStripeSecretKey(value?: string | null) {
  const key = value?.trim() ?? ""

  if (key.length < MIN_KEY_LENGTH) {
    return false
  }

  if (isStripePublishableKey(key) || isStripeWebhookSecret(key)) {
    return false
  }

  return SECRET_PREFIXES.some((prefix) => key.startsWith(prefix))
}

export function isStripePublishableKey(value?: string | null) {
  const key = value?.trim() ?? ""
  return (
    key.length >= MIN_KEY_LENGTH &&
    (key.startsWith("pk_test_") || key.startsWith("pk_live_"))
  )
}

export function isStripeWebhookSecret(value?: string | null) {
  const secret = value?.trim() ?? ""
  return secret.length >= MIN_KEY_LENGTH && secret.startsWith("whsec_")
}

export function maskCredential(value?: string | null) {
  const key = value?.trim() ?? ""

  if (key.length < 12) {
    return null
  }

  return `${key.slice(0, 8)}…${key.slice(-4)}`
}

export function isLiveStripeBlocked() {
  const secretKey = process.env.STRIPE_API_KEY?.trim() ?? ""

  if (!secretKey.startsWith("sk_live_") && !secretKey.startsWith("rk_live_")) {
    return false
  }

  if (process.env.NODE_ENV === "production") {
    return false
  }

  return process.env.STRIPE_ALLOW_LIVE !== "true"
}

export function getStripeEnvConfig() {
  const secretKey = process.env.STRIPE_API_KEY?.trim() ?? ""
  const publishableKey =
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_KEY?.trim() ||
    ""
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? ""
  const capture = process.env.STRIPE_CAPTURE === "true"
  const automaticPaymentMethods =
    process.env.STRIPE_AUTOMATIC_PAYMENT_METHODS !== "false"
  const autoEnableRegions = process.env.STRIPE_AUTO_ENABLE_REGIONS !== "false"
  const liveBlocked = isLiveStripeBlocked()
  const configured = isStripeSecretKey(secretKey) && !liveBlocked
  const secretMode = keyMode(secretKey)
  const publishableMode = keyMode(publishableKey)
  const modeMismatch = Boolean(
    configured &&
      publishableMode &&
      secretMode &&
      publishableMode !== secretMode
  )

  const warnings: string[] = []

  if (!isStripeSecretKey(secretKey)) {
    warnings.push(
      "Set STRIPE_API_KEY to a Stripe secret or restricted key (sk_test_, sk_live_, rk_test_, rk_live_) in apps/backend/.env, then restart Medusa."
    )
  } else if (liveBlocked) {
    warnings.push(
      "A live Stripe key is blocked in development. Use sk_test_ locally, or set STRIPE_ALLOW_LIVE=true only if you intend to charge real cards."
    )
  }

  if (configured && !isStripePublishableKey(publishableKey)) {
    warnings.push(
      "Set NEXT_PUBLIC_STRIPE_KEY (pk_test_ or pk_live_) on the storefront so checkout can load Stripe.js."
    )
  }

  if (modeMismatch) {
    warnings.push(
      "Publishable key mode does not match the secret key (test vs live). Checkout will fail until they match."
    )
  }

  if (
    configured &&
    process.env.NODE_ENV === "production" &&
    !isStripeWebhookSecret(webhookSecret)
  ) {
    warnings.push(
      "Set STRIPE_WEBHOOK_SECRET (whsec_) and register the webhook URL in the Stripe Dashboard. Required for 3-D Secure and capture updates."
    )
  }

  return {
    secretKey,
    publishableKey,
    webhookSecret,
    capture,
    automaticPaymentMethods,
    autoEnableRegions,
    configured,
    publishableConfigured: isStripePublishableKey(publishableKey),
    webhookConfigured: isStripeWebhookSecret(webhookSecret),
    liveMode: secretMode === "live",
    liveBlocked,
    modeMismatch,
    providerId: STRIPE_PROVIDER_ID,
    warnings,
  }
}

export function getStripeWebhookUrl() {
  const backend =
    process.env.BACKEND_URL?.trim() ||
    process.env.MEDUSA_BACKEND_URL?.trim() ||
    "http://localhost:9000"

  return `${backend.replace(/\/$/, "")}${STRIPE_WEBHOOK_PATH}`
}

export function getStripePaymentModule() {
  const config = getStripeEnvConfig()

  if (!config.configured) {
    return null
  }

  return {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/payment-stripe",
          id: STRIPE_PROVIDER_CONFIG_ID,
          options: {
            apiKey: config.secretKey,
            webhookSecret: config.webhookSecret || undefined,
            capture: config.capture,
            automaticPaymentMethods: config.automaticPaymentMethods,
            paymentDescription: "Super Core Industrial order",
          },
        },
      ],
    },
  }
}

export function paymentProviderPostureStatus() {
  const config = getStripeEnvConfig()

  if (config.liveBlocked) {
    return "warn" as const
  }

  if (config.configured) {
    if (
      process.env.NODE_ENV === "production" &&
      !isStripeWebhookSecret(process.env.STRIPE_WEBHOOK_SECRET)
    ) {
      return "warn" as const
    }

    return "pass" as const
  }

  if (process.env.PAYTR_MERCHANT_ID?.trim()) {
    return "pass" as const
  }

  return "warn" as const
}

export function paymentProviderRecommendation() {
  const config = getStripeEnvConfig()

  if (config.warnings.length) {
    return config.warnings[0]
  }

  return undefined
}
