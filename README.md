# Supercore Industrial

Medusa v2 + Next.js ecommerce monorepo for Supercore Industrial, running on Docker.

## Stack

| Service | URL | Notes |
|---|---|---|
| Storefront | http://localhost:8000 | Next.js starter |
| Medusa Admin | http://localhost:9000/app | Backend + admin |
| Medusa API | http://localhost:9000 | Store/Admin APIs |
| PostgreSQL | localhost:5432 | user/pass `postgres` / db `medusa-store` |
| Redis | localhost:6379 | Sessions / events |
| Typesense | localhost:8108 | Faceted search (API key in compose) |

Based on the official [Medusa DTC starter](https://github.com/medusajs/dtc-starter), customized with Supercore category taxonomy from `Supercore - Categories.docx`.

## Prerequisites

- Docker Desktop running
- (Optional later) Node.js 20+ installed **as Administrator** for host-side `pnpm` workflows

> Node MSI install failed without admin rights (`Error 1925`). Full stack runs via Docker without host Node.

## Quick start

```powershell
cd D:\Programs\supercoreindustrial
docker compose up --build -d
docker compose logs -f medusa
```

Wait until you see `Server is ready on port: 9000`.

### Create admin user

```powershell
docker compose exec medusa sh -c "cd /server/apps/backend && pnpm medusa user -e admin@supercore.local -p SuperCoreAdmin1!"
```

Login: http://localhost:9000/app

### Connect storefront publishable key

1. Admin â†’ **Settings** â†’ **API Key Management**
2. Open the Default Publishable API Key and copy the token (`pk_...`)
3. Put it in `apps/storefront/.env`:

```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

4. Recreate storefront so env is picked up:

```powershell
docker compose up -d --force-recreate storefront
```

## Useful commands

```powershell
docker compose logs -f              # all services
docker compose logs -f medusa       # backend only
docker compose down                 # stop
docker compose down -v              # stop + wipe DB volumes (re-seed on next up)
```

## Catalog seed

On first migrate/seed cycle the backend loads:

- Store: **Supercore Industrial** (GBP default)
- Region: UK & Europe
- Root categories: CCTV, PAGA, Intercom, PA, Solution Platforms, Ex devices, Network Audio, Access Control, Radar, Video Analytics, Hazardous/Safe Area, Cables
- Child categories from your Categories.docx (cameras, EXIGO/SPA-V2, IC-EDGE, marine cables, etc.)
- 3 sample products with MPN-style SKUs

## Project layout

```
apps/backend      Medusa v2 API + Admin
apps/storefront   Next.js storefront
docker-compose.yml
Dockerfile
start.sh / start-storefront.sh
```

## Next build steps

1. Replace sample products with real manufacturer SKUs / datasheets
2. Wire Typesense indexing for MPN + technical facets
3. Add Request Quote flow (B2B)
4. Brand the Next.js storefront to Supercore
5. Point git remote to your GitHub repo (`D:\Programs\Github\supercoreindustrial`)
