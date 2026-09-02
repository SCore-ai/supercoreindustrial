# Backend (`@dtc/backend`) — agent notes

Parent: [AGENTS.md](../../AGENTS.md) at repo root.

## Before coding

1. Load `.agents/skills/building-with-medusa/SKILL.md` and the matching reference file (api-routes, workflows, etc.).
2. Read `.cursor/rules/medusa-backend-stability.mdc` for stability pitfalls from recent audits.

## Stability checklist (every change)

| Check | Action |
| --- | --- |
| New Medusa module/provider in config | Add explicit `package.json` dependency at Medusa version |
| New API route under `src/api/` | Verify relative import depth to `src/lib/` |
| List endpoint with enrichment | One batch query for related entities, not N+1 |
| External HTTP (Zoho, webhook, npm) | `outboundFetch` + timeout; catalog uses `mapWithConcurrency` |
| Auth/signing secrets | `src/lib/security/secrets.ts` — no hardcoded fallbacks |
| Custom module model change | `medusa db:generate` + new migration file |

## Local run

- Prefer Docker: `pnpm run docker:up` or `.\scripts\dev-stack.ps1 up` (requires Docker Desktop).
- Backend only: `pnpm run backend:dev` (needs PostgreSQL + Redis + `.env` with 32+ char secrets).
- After backend changes in Docker: restart medusa container.

## Off-limits

Same as root AGENTS.md: `.medusa/`, hand-edited lockfile, committed `.env`, rewriting old migrations.
