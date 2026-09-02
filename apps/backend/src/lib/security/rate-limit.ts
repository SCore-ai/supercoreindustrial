import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { SECURITY_MODULE } from "../../modules/security"
import SecurityModuleService from "../../modules/security/service"

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function getClientKey(req: MedusaRequest) {
  const forwarded = req.headers["x-forwarded-for"]
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0]?.trim()

  return ip || req.ip || "unknown"
}

function consumeToken(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now }
  }

  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count }
}

export function createRateLimitMiddleware(options: {
  limit?: number
  limitKey?: "store" | "auth"
  windowMs?: number
  scopeKey?: string
}) {
  const windowMs = options.windowMs ?? 60_000

  return async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    try {
      const securityService = req.scope.resolve(
        SECURITY_MODULE
      ) as SecurityModuleService
      const settings = await securityService.getSettings()

      if (!settings.rate_limit_enabled) {
        next()
        return
      }

      const resolvedLimit =
        options.limit ??
        (options.limitKey === "auth"
          ? settings.rate_limit_auth_rpm
          : settings.rate_limit_store_rpm)

      const key = `${options.scopeKey ?? "store"}:${getClientKey(req)}`
      const result = consumeToken(key, resolvedLimit, windowMs)

      res.setHeader("X-RateLimit-Limit", String(resolvedLimit))
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, result.remaining)))

      if (!result.allowed) {
        if ("retryAfterMs" in result && result.retryAfterMs) {
          res.setHeader(
            "Retry-After",
            String(Math.ceil(result.retryAfterMs / 1000))
          )
        }

        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          "Too many requests. Please try again shortly."
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export async function resolveRateLimits(scope: {
  resolve: (key: string) => unknown
}) {
  const securityService = scope.resolve(SECURITY_MODULE) as SecurityModuleService
  const settings = await securityService.getSettings()

  return {
    enabled: settings.rate_limit_enabled,
    storeRpm: settings.rate_limit_store_rpm,
    authRpm: settings.rate_limit_auth_rpm,
  }
}
