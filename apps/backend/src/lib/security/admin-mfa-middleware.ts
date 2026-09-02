import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ADMIN_MFA_COOKIE,
  isAdminMfaEnforced,
  isAdminMfaExemptPath,
  readCookieHeader,
  requireAdminActorId,
  verifyAdminMfaToken,
} from "./admin-mfa"

export async function adminMfaMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const path = req.originalUrl || req.url || ""

    if (isAdminMfaExemptPath(path)) {
      next()
      return
    }

    const userId = requireAdminActorId(req)

    if (!userId) {
      next()
      return
    }

    const enforced = await isAdminMfaEnforced(req.scope)

    if (!enforced) {
      next()
      return
    }

    const token = readCookieHeader(req.headers.cookie, ADMIN_MFA_COOKIE)

    if (verifyAdminMfaToken(token, userId)) {
      next()
      return
    }

    res.status(403).json({
      code: "admin_mfa_required",
      message: "Admin MFA verification is required.",
    })
  } catch (error) {
    next(error)
  }
}
