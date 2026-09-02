import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../modules/b2b"
import B2bModuleService from "../../../../../modules/b2b/service"
import { allowsDedicatedRegistration } from "../../../../../lib/b2b/settings-guard"
import { notifyTradeRegistrationVerification } from "../../../../../lib/b2b/email/notifications"
import { issueVerificationCode } from "../../../../../lib/b2b/trade-registration-verification"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()

  if (!allowsDedicatedRegistration(settings)) {
    res.status(403).json({
      message:
        "Trade account registration via form is disabled. Submit a quote request instead.",
    })
    return
  }

  const body = (req.body || {}) as { email?: string }
  const email = body.email?.trim().toLowerCase()

  if (!email) {
    res.status(400).json({ message: "Email is required" })
    return
  }

  const existing = await b2bService.findCompanyByEmail(email)

  if (existing) {
    res.status(409).json({
      message:
        "A trade account with this email already exists. Sign in or contact support.",
      company_id: existing.id,
      status: existing.status,
    })
    return
  }

  const code = issueVerificationCode(email)

  await notifyTradeRegistrationVerification(req.scope, { email, code })

  res.status(200).json({
    email,
    message: "Verification code sent",
  })
}
