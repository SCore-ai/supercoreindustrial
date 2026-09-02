import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import {
  sendTestEmail,
  verifyEmailConnection,
} from "../../../../../../lib/b2b/email/test-email"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()
  const body = (req.body || {}) as {
    to?: string
    verify_only?: boolean
  }

  const recipient = body.to?.trim() || settings.email_admin?.trim() || ""

  const result = body.verify_only
    ? await verifyEmailConnection(settings)
    : await sendTestEmail(settings, recipient)

  res.json(result)
}
