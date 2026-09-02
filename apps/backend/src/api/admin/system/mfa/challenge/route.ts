import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { notifyAdminMfaChallenge } from "../../../../../lib/b2b/email/notifications"
import { issueVerificationCode } from "../../../../../lib/b2b/trade-registration-verification"
import {
  getAdminMfaDestinationEmail,
  isAdminMfaEnforced,
  maskEmail,
  requireAdminActorId,
} from "../../../../../lib/security/admin-mfa"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const userId = requireAdminActorId(req)

    if (!userId) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Admin authentication is required"
      )
    }

    const enforced = await isAdminMfaEnforced(req.scope)

    if (!enforced) {
      res.json({ required: false })
      return
    }

    const email = await getAdminMfaDestinationEmail(req.scope, userId)

    if (!email) {
      res.status(400).json({
        message: "No admin email address is configured for MFA.",
      })
      return
    }

    const code = issueVerificationCode(email, "admin-mfa")
    await notifyAdminMfaChallenge(req.scope, { email, code })

    res.json({
      required: true,
      email: maskEmail(email),
      message: "Verification code sent",
    })
  } catch (error) {
    if (error instanceof MedusaError) {
      if (error.type === MedusaError.Types.UNAUTHORIZED) {
        res.status(401).json({ message: error.message })
        return
      }

      if (error.type === MedusaError.Types.UNEXPECTED_STATE) {
        res.status(503).json({ message: error.message })
        return
      }
    }

    throw error
  }
}
