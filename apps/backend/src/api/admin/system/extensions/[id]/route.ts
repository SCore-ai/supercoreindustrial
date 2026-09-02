import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { toggleExtension } from "../../../../../lib/system/extensions/catalog-service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const body = (req.body || {}) as { enabled?: boolean }

  if (typeof body.enabled !== "boolean") {
    res.status(400).json({ message: "enabled must be a boolean" })
    return
  }

  try {
    const result = await toggleExtension(id, body.enabled)
    res.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle extension"

    res.status(400).json({ message })
  }
}
