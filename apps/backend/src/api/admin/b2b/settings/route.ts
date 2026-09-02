import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { B2B_MODULE } from "../../../../modules/b2b"
import B2bModuleService from "../../../../modules/b2b/service"
import type { UpdateB2bSettingsPayload } from "../../../../lib/b2b/settings-types"
import {
  getEmailSettingsStatus,
  sanitizeSettingsForAdmin,
} from "../../../../lib/b2b/settings-email"
import { getZohoSettingsStatus } from "../../../../lib/b2b/settings-zoho"

function buildSettingsResponse(settings: Awaited<
  ReturnType<B2bModuleService["getSettings"]>
>) {
  return {
    settings: sanitizeSettingsForAdmin(settings),
    zoho: getZohoSettingsStatus(settings),
    email: getEmailSettingsStatus(settings),
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const settings = await b2bService.getSettings()

  res.json(buildSettingsResponse(settings))
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const b2bService: B2bModuleService = req.scope.resolve(B2B_MODULE)
  const body = (req.body || {}) as UpdateB2bSettingsPayload

  const settings = await b2bService.updateSettings(body)

  res.json(buildSettingsResponse(settings))
}
