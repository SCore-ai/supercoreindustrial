import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { notifyMfaChallenge } from "../../../../../lib/b2b/email/notifications"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../lib/b2b/customer-context"
import { issueVerificationCode } from "../../../../../lib/b2b/trade-registration-verification"
import { SECURITY_MODULE } from "../../../../../modules/security"
import SecurityModuleService from "../../../../../modules/security/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireAuthenticatedCustomer(req)
    const securityService: SecurityModuleService =
      req.scope.resolve(SECURITY_MODULE)
    const settings = await securityService.getSettings()

    if (!settings.storefront_mfa_required) {
      res.json({ required: false })
      return
    }

    const context = await resolveStoreB2bContext(req.scope, customerId)

    if (!context.companyId || !context.email) {
      res.json({ required: false })
      return
    }

    const code = issueVerificationCode(context.email, "mfa")
    await notifyMfaChallenge(req.scope, { email: context.email, code })

    res.json({
      required: true,
      email: context.email,
      message: "Verification code sent",
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
