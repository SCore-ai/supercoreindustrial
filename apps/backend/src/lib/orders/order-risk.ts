export type OrderRiskLevel = "low" | "medium" | "high"

export type OrderRiskAssessment = {
  level: OrderRiskLevel
  score: number
  headline: string
  message: string
  three_ds_authenticated: boolean
}

const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "yopmail.com",
]

export function assessOrderRisk(input: {
  total?: number | null
  customer_id?: string | null
  customer_order_count: number
  payment_status?: string | null
  email?: string | null
  metadata?: Record<string, unknown> | null
}): OrderRiskAssessment {
  const metadata = input.metadata ?? {}
  let score = 10

  const threeDs =
    metadata.payment_3ds_authenticated === true ||
    metadata.three_ds_authenticated === true ||
    metadata["3ds_authenticated"] === true

  if (threeDs) {
    score -= 15
  }

  if (!input.customer_id) {
    score += 25
  }

  if (input.customer_order_count <= 1) {
    score += 15
  }

  const total = input.total ?? 0
  if (total >= 100000) {
    score += 20
  } else if (total >= 50000) {
    score += 10
  }

  const payment = (input.payment_status ?? "").toLowerCase()
  if (payment && !["captured", "paid", "partially_refunded"].includes(payment)) {
    score += 20
  }

  const emailDomain = input.email?.split("@")[1]?.toLowerCase()
  if (emailDomain && DISPOSABLE_DOMAINS.includes(emailDomain)) {
    score += 25
  }

  if (metadata.supercore_test_draft === true) {
    score = Math.min(score, 15)
  }

  score = Math.max(0, Math.min(100, score))

  let level: OrderRiskLevel = "low"
  if (score >= 60) {
    level = "high"
  } else if (score >= 35) {
    level = "medium"
  }

  const headline =
    level === "low"
      ? "This order is low risk"
      : level === "medium"
        ? "This order is medium risk"
        : "This order is high risk"

  const message =
    level === "low"
      ? "Chargeback risk is low. You can fulfill this order."
      : level === "medium"
        ? "Review payment details and customer history before fulfilling."
        : "Review carefully before fulfilling. Consider contacting the customer."

  return {
    level,
    score,
    headline,
    message,
    three_ds_authenticated: threeDs,
  }
}
