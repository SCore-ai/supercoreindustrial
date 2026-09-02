import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  ADMIN_MFA_COOKIE,
  getAdminMfaDestinationEmail,
  isAdminMfaEnforced,
  maskEmail,
  readCookieHeader,
  requireAdminActorId,
  verifyAdminMfaToken,
} from "../../../../../lib/security/admin-mfa"
import { SECURITY_MODULE } from "../../../../../modules/security"
import SecurityModuleService from "../../../../../modules/security/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const userId = requireAdminActorId(req)

    if (!userId) {
      throw new MedusaError(
        MedusaError.Types.UNAUTHORIZED,
        "Admin authentication is required"
      )
    }

    const securityService: SecurityModuleService =
      req.scope.resolve(SECURITY_MODULE)
    const settings = await securityService.getSettings()
    const enforced = await isAdminMfaEnforced(req.scope)
    const email = await getAdminMfaDestinationEmail(req.scope, userId)
    const token = readCookieHeader(req.headers.cookie, ADMIN_MFA_COOKIE)
    const verified = verifyAdminMfaToken(token, userId)

    res.json({
      required: settings.admin_mfa_required,
      enforced,
      verified,
      email: maskEmail(email),
      bypass: process.env.ADMIN_MFA_BYPASS === "true",
    })
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
