import type { MedusaResponse } from "@medusajs/framework/http"

export function sendPdfResponse(
  res: MedusaResponse,
  buffer: Buffer,
  filename: string
) {
  const safeName = filename.replace(/[^\w.-]/g, "_")

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`)
  res.setHeader("Content-Length", String(buffer.length))
  res.setHeader("Cache-Control", "private, no-store")
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.status(200).send(buffer)
}
