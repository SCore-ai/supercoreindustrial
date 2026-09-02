import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { verifyEmailCode } from "../../../../../lib/b2b/trade-registration-verification"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { email?: string; code?: string }
  const email = body.email?.trim().toLowerCase()
  const code = body.code?.trim()

  if (!email || !code) {
    res.status(400).json({ message: "Email and verification code are required" })
    return
  }

  const verificationToken = verifyEmailCode(email, code)

  if (!verificationToken) {
    res.status(400).json({
      message: "Invalid or expired verification code. Request a new code.",
    })
    return
  }

  res.status(200).json({
    email,
    verification_token: verificationToken,
  })
}
