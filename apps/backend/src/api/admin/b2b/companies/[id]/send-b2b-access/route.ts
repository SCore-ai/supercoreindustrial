import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../../../modules/b2b"
import B2bModuleService from "../../../../../../modules/b2b/service"
import { notifyB2bAccessInvite } from "../../../../../../lib/b2b/email/notifications"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const { id } = req.params
  const body = (req.body || {}) as { email?: string | null }

  const company = await b2bService.retrieveCompanyWithMembers(id)
  const email = body.email?.trim() || company.email

  if (!email) {
    res.status(400).json({ message: "Email is required" })
    return
  }

  await notifyB2bAccessInvite(req.scope, {
    companyName: company.name,
    email,
  })

  res.status(200).json({
    company_id: id,
    email,
    sent: true,
  })
}
