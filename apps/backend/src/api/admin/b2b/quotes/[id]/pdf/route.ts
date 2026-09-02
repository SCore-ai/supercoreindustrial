import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { generateOfferPdf } from "../../../../../../lib/b2b/offer-pdf/load-offer-pdf"
import { sendPdfResponse } from "../../../../../../lib/b2b/offer-pdf/http"
import { requireAdminActorId } from "../../../../../../lib/security/admin-mfa"
import { auditFromRequest } from "../../../../../../lib/security/audit"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (!requireAdminActorId(req)) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Admin authentication is required"
    )
  }

  const { id } = req.params
  const { document, buffer } = await generateOfferPdf(req.scope, id)

  await auditFromRequest(req, {
    actor_type: "admin",
    action: "quotes.offer_pdf.downloaded",
    resource_type: "quote",
    resource_id: id,
    summary: `Downloaded offer PDF ${document.offer_number}`,
  })

  sendPdfResponse(res, buffer, document.filename)
}
