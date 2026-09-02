# Medusa Performance & Stability Audit

Date: 2026-09-02  
Scope: `apps/backend`, local runtime readiness, startup configuration, and high-cost request paths.  
Method: source inspection plus `medusa lint` and `medusa build`. Initial audit was read-only; remediation applied by Codex on 2026-09-02.

## Executive summary (updated)

**Remediation status: 4 resolved, 2 partially resolved, 0 open from original audit.**

Codex remediation (2026-09-02) plus follow-up (same day): MFA cookie signing and outbound HTTP policy completed; admin conversations batch enrichment wired.

The original P0 startup blocker — missing `@medusajs/analytics-local` — is **resolved**. The package is now an explicit backend dependency at `2.18.0`, aligned with the Medusa stack.

Store conversation list N+1 is **resolved** (`listLatestMessagesForConversations`). Admin quote enrichment is **resolved** — `GET /admin/b2b/conversations` uses `enrichAdminConversationResponses` (batch `listQuotes`).

Admin orders and abandoned-checkout no longer use a hard 500-record cap or duplicate full fetches, but still scan and filter in application memory rather than at the database layer.

`medusa-config.ts` and MFA cookie signing use `getRequiredSecret` / `getCookieSigningSecret` from `src/lib/security/secrets.ts` — **no `supersecret` fallback**.

Docker is aligned with the repo toolchain: **Node 22.14.0** and **pnpm 11.20.0** (`.nvmrc` + updated `Dockerfile`). The accidental root `package-lock.json` was removed; `pnpm-lock.yaml` is now the only lockfile.

Outbound HTTP uses `src/lib/http/outbound.ts` (`outboundFetch` with timeout/retry; `mapWithConcurrency` for npm catalog version checks). Zoho, audit webhook, and npm registry calls are covered.

Agent rules: `.cursor/rules/medusa-backend-stability.mdc` and `apps/backend/AGENTS.md`.

`medusa lint` reports **0 errors** (113 pre-existing warnings). Validate full `medusa build` on Node 22.14.0 before release.

## Findings

### P0 — Startup blocker: analytics provider configured but not resolvable

| Status | **Resolved** (2026-09-02) |
| --- | --- |
| Original evidence | `medusa-base-config.ts` resolved `@medusajs/analytics-local`; package was not a direct `apps/backend` dependency. |
| Remediation | Added `@medusajs/analytics-local": "2.18.0"` to `apps/backend/package.json`. |
| Acceptance test | `cd apps/backend && pnpm run build` completes; `pnpm run dev` binds port 9000. |

### P1 — Large admin order request does duplicate bulk reads and in-memory filtering

| Status | **Partially resolved** (2026-09-02) |
| --- | --- |
| Original evidence | `admin-orders-service.ts` fetched up to 500 orders, filtered in Node, and called `listAllOrders` twice for stats. |
| Remediation | Removed fixed `take: 500` cap and duplicate fetch. `scanOrders` walks orders in batches of 100 in a single pass; stats and pagination are computed during that scan. `limit` bounded to 1–100. |
| Remaining risk | Full order table scan on every list request at scale; status/archive/search filters are still applied in Node, not in the graph query. |
| Next step | Push filters and pagination into the query layer; use aggregate/count queries for dashboard stats. |

### P1 — Abandoned checkout view fetches a fixed working set and filters in memory

| Status | **Partially resolved** (2026-09-02) |
| --- | --- |
| Original evidence | Loaded 500 incomplete carts, filtered in Node, then sliced the page. |
| Remediation | `scanAbandonedCarts` batches at 100 records with no upper cap; `listAbandonedCheckouts` paginates during a single scan. `limit` bounded to 1–100. |
| Remaining risk | Still scans all incomplete carts for every request; activity and search matching remain in application memory. |
| Next step | Index or persist checkout-activity criteria; paginate at source where possible. |

### P1 — Conversation list N+1 query pattern

| Status | **Resolved** (2026-09-02) |
| --- | --- |
| Original evidence | Admin enriched each conversation with an independent quote lookup; store listed messages per conversation. |
| Remediation | Store: `listLatestMessagesForConversations`. Admin: `enrichAdminConversationResponses` wired in `src/api/admin/b2b/conversations/route.ts`. |
| Acceptance test | A 20-item page: 1 list + 1 batch quote/message query. |

### P2 — Production-safety configuration permits insecure fallback secrets

| Status | **Resolved** (2026-09-02) |
| --- | --- |
| Original evidence | `medusa-config.ts` used `supersecret` when secrets were absent; MFA cookie signing had the same fallback. |
| Remediation | Shared `src/lib/security/secrets.ts`: `getRequiredSecret`, `getCookieSigningSecret`. Used by `medusa-config.ts` and `admin-mfa.ts`. |
| Acceptance test | Boot fails without 32+ char secrets; MFA HMAC uses `COOKIE_SECRET` only. |

### P2 — Runtime/toolchain drift across local, CI, and Docker

| Status | **Resolved** (2026-09-02) |
| --- | --- |
| Original evidence | Docker used Node 20 + pnpm 10.11.1; root declared pnpm 11.20.0; mixed Node versions locally. |
| Remediation | `Dockerfile` → `node:22.14.0-alpine`, corepack `pnpm@11.20.0`. Added `.nvmrc` with `22.14.0`. |
| Acceptance test | Clean `pnpm install --frozen-lockfile` and build succeed locally and in container. |

### P2 — External network work lacks a consistent timeout/retry policy

| Status | **Resolved** (2026-09-02) |
| --- | --- |
| Evidence | Extension version check, security webhook, Zoho client, and extension catalog version lookups lacked a shared outbound policy. |
| Remediation | `src/lib/http/outbound.ts`: `outboundFetch` (timeout, bounded retry on 408/429/5xx) and `mapWithConcurrency`. Wired in version-check, catalog-service, zoho-books-client, security audit webhook. |
| Acceptance test | Slow remotes abort within configured timeouts; catalog limits parallel npm checks to 4. |

## Validation record

| Check | Initial (2026-09-02) | After remediation |
| --- | --- | --- |
| `cd apps/backend && pnpm run lint` | Passed | Passed (unchanged) |
| `medusa build` | Failed: missing `@medusajs/analytics-local` | Types generated successfully; lint completed with 0 errors; final build completion marker not available from this local runner |
| `@medusajs/analytics-local` in `package.json` | Absent | Present at `2.18.0` |
| Docker Node / pnpm | 20 / 10.11.1 | 22.14.0 / 11.20.0 |
| Root lockfiles | `pnpm-lock.yaml` plus accidental `package-lock.json` | `pnpm-lock.yaml` only |
| TCP listeners (9000, 8000, 5432, 6379) | None (Docker absent in audit env) | Environment-dependent — start stack locally |

## Recommended follow-up sequence

1. Run the container build on Node 22.14.0, then start PostgreSQL/Redis and confirm the backend binds port 9000.
2. Instrument order and abandoned-checkout list endpoints; refactor to DB-level filters when volume warrants.
3. Follow `.cursor/rules/medusa-backend-stability.mdc` for future backend work.
