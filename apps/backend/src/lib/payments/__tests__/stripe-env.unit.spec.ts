import {
  isStripeSecretKey,
  isStripePublishableKey,
  isStripeWebhookSecret,
  maskCredential,
  paymentProviderPostureStatus,
  getStripeEnvConfig,
  getStripePaymentModule,
} from "../stripe-env"

describe("Stripe env helpers", () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    const restore = (key: string) => {
      const value = originalEnv[key]
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }

    restore("STRIPE_API_KEY")
    restore("STRIPE_WEBHOOK_SECRET")
    restore("STRIPE_PUBLISHABLE_KEY")
    restore("NEXT_PUBLIC_STRIPE_KEY")
    restore("STRIPE_ALLOW_LIVE")
    restore("STRIPE_CAPTURE")
    restore("STRIPE_AUTOMATIC_PAYMENT_METHODS")
    restore("PAYTR_MERCHANT_ID")
    restore("NODE_ENV")
  })

  it("accepts only Stripe secret and restricted keys", () => {
    expect(isStripeSecretKey("sk_test_configured_key_12345")).toBe(true)
    expect(isStripeSecretKey("sk_live_configured_key_12345")).toBe(true)
    expect(isStripeSecretKey("rk_test_restricted_key_12345")).toBe(true)
    expect(isStripeSecretKey("pk_test_configured_key_12345")).toBe(false)
    expect(isStripeSecretKey("not-a-key")).toBe(false)
    expect(isStripeSecretKey("sk_test_short")).toBe(false)
  })

  it("masks credentials without exposing the secret", () => {
    expect(maskCredential("sk_test_1234567890abcd")).toBe("sk_test_…abcd")
  })

  it("requires a webhook secret shape", () => {
    expect(isStripeWebhookSecret("whsec_abcdefghijklmnopqrstuv")).toBe(true)
    expect(isStripeWebhookSecret("sk_test_configured_key_12345")).toBe(false)
  })

  it("rejects publishable keys as secret keys", () => {
    expect(isStripePublishableKey("pk_live_configured_key_12345")).toBe(true)
    expect(isStripeSecretKey("pk_live_configured_key_12345")).toBe(false)
  })

  it("passes posture when a Stripe secret key is set", () => {
    process.env.STRIPE_API_KEY = "sk_test_configured_key_12345"
    process.env.NODE_ENV = "development"
    expect(paymentProviderPostureStatus()).toBe("pass")
    expect(getStripePaymentModule()).not.toBeNull()
  })

  it("blocks live keys in development unless explicitly allowed", () => {
    process.env.STRIPE_API_KEY = "sk_live_configured_key_12345"
    process.env.NODE_ENV = "development"
    delete process.env.STRIPE_ALLOW_LIVE
    expect(getStripeEnvConfig().liveBlocked).toBe(true)
    expect(getStripeEnvConfig().configured).toBe(false)
    expect(getStripePaymentModule()).toBeNull()
    expect(paymentProviderPostureStatus()).toBe("warn")
  })

  it("registers Stripe with camelCase Payment Element options", () => {
    process.env.STRIPE_API_KEY = "sk_test_configured_key_12345"
    process.env.NODE_ENV = "development"
    delete process.env.STRIPE_CAPTURE
    delete process.env.STRIPE_AUTOMATIC_PAYMENT_METHODS
    const moduleConfig = getStripePaymentModule()
    const provider = moduleConfig?.options.providers[0]

    expect(provider?.options).toMatchObject({
      capture: false,
      automaticPaymentMethods: true,
    })
    expect(provider?.options).not.toHaveProperty("automatic_payment_methods")
  })
})
