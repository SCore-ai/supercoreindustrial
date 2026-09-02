import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import {
  requireAuthenticatedCustomer,
  resolveStoreB2bContext,
} from "../../../../../lib/b2b/customer-context"
import { consumeOneTimeCode } from "../../../../../lib/b2b/trade-registration-verification"
import { auditFromRequest } from "../../../../../lib/security/audit"
import { SECURITY_MODULE } from "../../../../../modules/security"
import SecurityModuleService from "../../../../../modules/security/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireAuthenticatedCustomer(req)
    const securityService: SecurityModuleService =
      req.scope.resolve(SECURITY_MODULE)
    const settings = await securityService.getSettings()
    const body = (req.body || {}) as { code?: string }
    const code = body.code?.trim() ?? ""

    if (!settings.storefront_mfa_required) {
      res.json({ verified: true, required: false })
      return
    }

    const context = await resolveStoreB2bContext(req.scope, customerId)

    if (!context.companyId || !context.email) {
      res.json({ verified: true, required: false })
      return
    }

    if (!consumeOneTimeCode(context.email, code, "mfa")) {
      res.status(400).json({ message: "Invalid or expired verification code." })
      return
    }

    await auditFromRequest(req, {
      actor_type: "customer",
      actor_id: customerId,
      actor_email: context.email,
      action: "auth.mfa.verified",
      resource_type: "customer",
      resource_id: customerId,
      company_id: context.companyId,
      summary: `Storefront MFA verified for ${context.email}`,
    })

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
