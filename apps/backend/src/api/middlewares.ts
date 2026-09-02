import { defineMiddlewares } from "@medusajs/framework/http"
import { adminMfaMiddleware } from "../lib/security/admin-mfa-middleware"
import { createRateLimitMiddleware } from "../lib/security/rate-limit"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/system/mfa*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "admin-mfa",
          limitKey: "auth",
          limit: 10,
        }),
      ],
    },
    {
      matcher: "/admin/system/payments*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "admin-payments",
          limitKey: "auth",
          limit: 20,
        }),
      ],
    },
    {
      matcher: "/admin*",
      middlewares: [adminMfaMiddleware],
    },
    {
      matcher: "/store/auth*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "auth",
          limitKey: "auth",
        }),
      ],
    },
    {
      matcher: "/store/b2b/register",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "b2b-register",
          limitKey: "auth",
          limit: 10,
        }),
      ],
    },
    {
      matcher: "/store/b2b/mfa*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "b2b-mfa",
          limitKey: "auth",
          limit: 10,
        }),
      ],
    },
    {
      matcher: "/store/b2b/quotes*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "b2b-quotes",
          limitKey: "store",
        }),
      ],
    },
    {
      matcher: "/store/carts*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "carts",
          limitKey: "store",
        }),
      ],
    },
    {
      matcher: "/store/customers/me*",
      middlewares: [
        createRateLimitMiddleware({
          scopeKey: "customers",
          limitKey: "store",
        }),
      ],
    },
  ],
})
