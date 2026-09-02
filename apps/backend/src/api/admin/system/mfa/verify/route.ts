import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { consumeOneTimeCode } from "../../../../../lib/b2b/trade-registration-verification"
import { auditFromRequest } from "../../../../../lib/security/audit"
import {
  buildAdminMfaCookie,
  getAdminMfaDestinationEmail,
  isAdminMfaEnforced,
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
    const body = (req.body || {}) as { code?: string }
    const code = body.code?.trim() ?? ""

    if (!enforced) {
      res.json({ verified: true, required: false })
      return
    }

    const email = await getAdminMfaDestinationEmail(req.scope, userId)

    if (!email) {
      res.status(400).json({
        message: "No admin email address is configured for MFA.",
      })
      return
    }

    if (!consumeOneTimeCode(email, code, "admin-mfa")) {
      res.status(400).json({ message: "Invalid or expired verification code." })
      return
    }

    await auditFromRequest(req, {
      actor_type: "admin",
      actor_id: userId,
      actor_email: email,
      action: "auth.admin_mfa.verified",
      resource_type: "user",
      resource_id: userId,
      summary: `Admin MFA verified for ${email}`,
    })

    res.setHeader("Set-Cookie", buildAdminMfaCookie(userId))
    res.json({ verified: true, required: true })
  } catch (error) {
    if (error instanceof MedusaError) {
      if (error.type === MedusaError.Types.UNAUTHORIZED) {
        res.status(401).json({ message: error.message })
        return
      }
    }

    throw error
  }
}
