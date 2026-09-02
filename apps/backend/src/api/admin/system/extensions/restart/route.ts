import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readExtensionsState, writeExtensionsState } from "../../../../../lib/system/extensions/state"

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as { pending_restart?: boolean }

  if (body.pending_restart === false) {
    const state = readExtensionsState()
    writeExtensionsState({
      ...state,
      pending_restart: false,
    })
  }

  res.json({ ok: true })
}
