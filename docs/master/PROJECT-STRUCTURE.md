# Supercore Industrial Systems Ltd — Project Structure

**Last updated:** 9 August 2026 (v1.10)  
**Documentation:** `docs/master/`  
**Category revision:** v1.6 — 14 root categories, 88 handles (`supercore-category-tree.ts`)
**Repository:** `D:\Programs\supercoreindustrial`  
**Brand:** Supercore Industrial Systems Ltd ([supercoreai.co.uk](https://supercoreai.co.uk))  
**UI reference:** [industrialnetworking.com](https://www.industrialnetworking.com/) (layout/UX; Supercore branding)

---

## 1. Overview

Medusa v2 + Next.js 15 monorepo for **Supercore Industrial** — an industrial ecommerce platform selling Supercore-native systems (CCTV, PAGA, intercom, hazardous-area) plus extended connectivity catalogue (industrial networking, private/public cellular, managed services) and partner-program offerings.

| Service | URL | Notes |
|---|---|---|
| Storefront | http://localhost:8000 | Next.js App Router |
| Medusa Admin | http://localhost:9000/app | Catalog, orders, API keys |
| Medusa API | http://localhost:9000 | Store + Admin REST |
| PostgreSQL | localhost:5432 | `postgres` / `medusa-store` |
| Redis | localhost:6379 | Sessions / events |
| Typesense | localhost:8108 | Faceted / MPN search |

---

## 2. Repository layout

```
supercoreindustrial/
├── apps/
│   ├── backend/                    # Medusa v2 API + Admin
│   │   ├── medusa-config.ts
│   │   ├── src/
│   │   │   ├── admin/              # Admin extensions (B2B quote requests UI)
│   │   │   ├── api/store/          # Custom store routes (search, quotes)
│   │   │   ├── api/admin/b2b/      # Admin API (quote list, workflow, ERP metadata)
│   │   │   ├── modules/quote/      # Quote cart module (models, service, migrations)
│   │   │   ├── workflows/quote/    # Create / add line / submit / admin update workflows
│   │   │   ├── migration-scripts/  # initial-data-seed.ts, supercore-category-tree.ts
│   │   │   ├── subscribers/        # Typesense indexing, quote.submitted (Zoho stub)
│   │   │   ├── lib/b2b/            # Quote metadata types, ERP helpers
│   │   │   └── lib/typesense-client.ts
│   │   └── integration-tests/
│   └── storefront/                 # Next.js storefront
│       ├── public/brand/           # Supercore logo assets
│       └── src/
│           ├── app/[countryCode]/  # All routes (country-prefixed)
│           ├── lib/                # Brand, navigation, page registry, home content
│           ├── lib/mega-menu/      # Catalog nav builder, INS layout tokens
│           ├── modules/            # UI components by domain
│           └── styles/globals.css
├── docker-compose.yml
├── Dockerfile
├── turbo.json
├── pnpm-lock.yaml
└── docs/
    ├── README.md
    └── master/
        ├── PROJECT-STRUCTURE.md    # This document
        ├── NAVIGATION-MENU.md
        ├── SUPERCORE-CATEGORIES.md
        ├── B2B-QUOTE-ADMIN.md      # B2B quote admin + Zoho ERP extensibility
        ├── STOREFRONT-PRODUCT-PAGE.md  # Industrial PDP (gallery, purchase panel)
        └── STOREFRONT-B2B-ACCOUNT.md   # Trade portal + conversations UI
```

---

## 3. Storefront architecture

### 3.1 Routing (`apps/storefront/src/app/[countryCode]/`)

| Route | Purpose |
|---|---|
| `/` | Homepage (hero carousel, quick links, services, categories, blog, about, CTA) |
| `/store` | Medusa product catalog |
| `/search` | Part-number / keyword search (Typesense) |
| `/products/[handle]` | Product detail page |
| `/categories/[...category]` | Supercore category pages (Medusa) |
| `/collections/[handle]` | Collection pages |
| `/cart`, `/checkout`, `/account` | Commerce flows |
| `/quote` | B2B quote cart (add to quote, submit) |
| `/register-trade` | Trade account registration |
| `/account/trade` | B2B trade portal overview |
| `/account/trade/quotes` | Customer quote list |
| `/account/trade/messages` | B2B conversations (list + thread) |
| `/account/trade/approvals` | Order approval status |
| `/[...slug]` | **Marketing pages** (~100+ routes from page registry) |

Country prefix is applied by middleware (`src/middleware.ts`). Links use `LocalizedClientLink` (never hardcode `/gb/`).

### 3.2 Homepage sections

| Section | Component | Content source |
|---|---|---|
| Hero carousel (3 slides) | `modules/home/components/hero-carousel` | `lib/home-content.ts` → `HERO_SLIDES` |
| Quick links (6 icons) | `modules/home/components/quick-links` | `QUICK_LINKS` |
| **Core Systems** (4 cards) | `modules/home/components/services-grid` | `CORE_SERVICE_CARDS` — CCTV, PAGA, Intercom, Hazardous Area |
| **Connectivity & Managed Services** (4 cards) | same | `CONNECTIVITY_TECHNOLOGY_CARDS` — Industrial Networking, Private Cellular, Public Cellular, Managed Services |
| Featured categories | `modules/home/components/featured-categories` | `FEATURED_CATEGORY_TILES` |
| Resources / insights | `modules/home/components/resources-grid` | `RESOURCE_CARDS` |
| About block | `modules/home/components/about-block` | `ABOUT_COPY`, `ABOUT_IMAGE` |
| Featured products (Medusa) | `modules/home/components/featured-products` | Live collections |
| CTA banner | `modules/home/components/cta-banner` | Static |

### 3.3 Navigation

| File | Purpose |
|---|---|
| `lib/site-navigation.ts` | Mega-menu labels; partner + engineering + company links |
| `lib/mega-menu/catalog-nav.ts` | Medusa category tree → Products mega menu data |
| `modules/layout/components/mega-menu/` | Desktop mega menu (click-to-open, INS slide animation) |
| `modules/layout/components/nav-bar-client/` | Header grid; INS-style expandable search |
| `modules/layout/components/side-menu` | Mobile full menu |
| `modules/layout/components/announcement-bar` | Top banner |
| `modules/layout/components/search-bar` | Part-number search → `/search` |

### 3.4 Marketing pages

| File | Purpose |
|---|---|
| `lib/site-pages/types.ts` | Page section types |
| `lib/site-pages/registry.ts` | All static page content (~100+ slugs) |
| `app/.../[...slug]/page.tsx` | Dynamic catch-all renderer |
| `modules/marketing/templates/content-page` | Page shell |
| `modules/marketing/components/page-hero` | Hero blocks |
| `modules/marketing/components/page-sections` | Cards, CTAs, category grids, contact, partners |

**Key marketing routes:** `/about`, `/our-history`, `/meet-the-team`, `/engineering/*`, `/mining-aggregates`, `/upstream-oil-gas`, `/contact-us`, `/get-a-quote`, `/partners-programs`, `/offerings`, `/industries`, `/technologies`, `/all-products`, `/all-products/*`, `/brands/*`, `/categories/*`, `/managed-services`, `/support`, `/resources/tag/Blog`

### 3.5 Product detail page (PDP)

Industrial B2B product page at `/products/[handle]`. Full spec: **`docs/master/STOREFRONT-PRODUCT-PAGE.md`**.

| Area | Implementation |
|---|---|
| Gallery | Multi-image thumbnails, hover magnifier, lightbox zoom/pan |
| Purchase panel | Manufacturer, Model, SKU, variants, qty, VAT price, CTAs, stock, courier |
| Content tabs | Description, Features, Specifications, Documents, Shipping |
| Matrix mode | Full variant table for multi-SKU products (e.g. EDS-305) |
| Metadata | `product.metadata` drives specs, documents, short description |

**Key paths:** `modules/products/templates/`, `modules/products/components/product-gallery-enhanced/`, `lib/util/product-page-content.ts`

See also **`docs/master/STOREFRONT-B2B-ACCOUNT.md`** for trade portal and conversations.

### 3.6 Brand & design tokens

| File | Purpose |
|---|---|
| `lib/brand.ts` | Supercore name, legal entity, contact, logo path, markets |
| `lib/home-content.ts` | Homepage copy and images |
| `styles/globals.css` | CSS variables (`--sc-accent`, `--sc-cta`, etc.) |
| `tailwind.config.js` | Montserrat (display) + Open Sans (body), `sc-*` palette |
| `public/brand/logo-stacked-light.png` | Nav logo (light background) |
| `public/brand/logo-stacked-dark.png` | Footer logo (dark background) |
| `public/brand/logo-horizontal-dark.png` | Horizontal logo variant |

**Color palette (Supercore-branded):**

- Navy ink: `#0A1628`
- Body / links: `#0A0A0A` (hover: `#FFB700`)
- CTA gold: `#FFB700` (hover: `#E6A500`)

---

## 4. Backend architecture

### 4.1 Medusa modules

Standard Medusa v2 DTC starter with custom additions:

| Path | Purpose |
|---|---|
| `src/modules/quote/` | Quote + quote line item models, service, migrations |
| `src/api/store/quotes/` | Store API: create quote, line items, submit |
| `src/workflows/quote/` | Business logic for quote cart operations |
| `src/api/store/search/route.ts` | Typesense-backed product search |
| `src/subscribers/product-search-index.ts` | Index on product create/update |
| `src/lib/typesense-client.ts` | Typesense client |
| `src/migration-scripts/supercore-category-tree.ts` | Full Medusa category taxonomy (Products) |
| `src/lib/multi-region-config.ts` | GBP / EUR / USD region definitions (UK, Europe, US & ME) |
| `src/migration-scripts/initial-data-seed.ts` | Store, multi-region pricing, recursive category seed, sample products |
| `src/scripts/backfill-multi-region-pricing.ts` | Split single region into GBP/EUR/USD on existing databases |

### 4.2 B2B quote admin

| Path | Purpose |
|---|---|
| `src/admin/routes/orders/quote-requests/` | Admin UI: list + detail pages |
| `src/admin/widgets/order-quote-request.tsx` | Order detail widget (linked quote) |
| `src/api/admin/b2b/quotes/` | Admin REST: list, update workflow, ERP metadata |
| `src/lib/b2b/quote-integration.ts` | `metadata.admin_status`, `metadata.erp` (Zoho Books) |
| `src/subscribers/quote-submitted.ts` | `quote.submitted` event — Zoho sync hook (stub) |

**Admin navigation:** Orders → **Quote requests** (`/app/orders/quote-requests`)

See `docs/master/B2B-QUOTE-ADMIN.md` for API routes, metadata schema, and Zoho integration plan.

### 4.3 Catalog taxonomy (seeded)

**Root categories (14):** CCTV (Explosion-Protected is a leaf), PAGA, Intercom, Public Address, Solution Platforms, EX Devices, Network audio, Access control, Radar (incl. Sensors), Video analytics, Hazardous Area, Safe Area, Cables, Legacy Devices (EOL) — **88 handles** total. See `docs/master/SUPERCORE-CATEGORIES.md` v1.6.

**Engineering services (nav):** Industrial Communication, Fire & Gas, System Integration, Global Supply, etc. → `/engineering/{slug}`

**Markets We Serve (nav):** Upstream Oil & Gas, Midstream Oil & Gas, Refining & Petrochemical, Subsea, Renewables, Ports & Marine Operations, Power Generation, ITS & Transportation, Industrial, Healthcare

**Company pages (nav):** Our History, Meet The Team, QHSE, Net Zero, Success Stories, etc.

**Partner catalogue (marketing/nav):** Ethernet Switches, Cellular Gateways, Security Appliances, Cabling, Antennas, KVM, etc. → `/all-products/{slug}`

**Brands (nav):** Moxa, Cisco, Hirschmann, Digi, Belden, DINSpace, PULS, Ericsson, Adder, Semtech, and others

---

## 5. Docker stack

```powershell
cd D:\Programs\supercoreindustrial
docker compose up --build -d
```

Services: `postgres`, `redis`, `typesense`, `medusa` (backend), `storefront`

After code changes to storefront:

```powershell
docker compose restart storefront
```

For faster local development, run the storefront on the host (`pnpm run storefront:dev`) while keeping backend services in Docker. Production-speed testing: `cd apps/storefront && pnpm build && pnpm start`.

---

## 6. Implementation phases

### Phase 1 — Complete ✅

- [x] Medusa v2 + Next.js monorepo (Docker)
- [x] INS-matching UI/UX (hero, quick links, mega menu, footer)
- [x] Supercore branding + logo from supercoreai.co.uk
- [x] Dual services grid (Core Systems + Connectivity Technologies)
- [x] ~100+ marketing pages via page registry
- [x] Partner programs page
- [x] Contact / quote forms
- [x] Typesense search infrastructure
- [x] Supercore category seed data
- [x] Revised category tree v1.4 synced to Medusa (`backfill-supercore-categories.ts`)

### Phase 2 — In progress / next

- [x] **Product variant matrix** (EDS-305 style SKU table on PDP)
- [x] **Request Quote / Add to Quote** workflow (B2B cart + backend persistence)
- [x] **B2B quote admin** — Orders → Quote requests; workflow status, order link, ERP metadata panel
- [x] **INS-style mega menu UX** — click to open panels; 300ms slide-down animation; rail hover switches content
- [x] **INS-style expandable search** — logo/nav hide; search bar fills header (~1.5s)
- [ ] **Populate full INS product catalogue** in Medusa (SKUs, MPNs, pricing)
- [ ] **PDF spec sheets** on product pages (`metadata.spec_sheet_url`)
- [ ] **Individual blog/resource article pages**
- [ ] **Partner portal login** (integrator pricing)
- [ ] **Map `/all-products/*` categories** to Medusa collections/filters
- [ ] **Supercore AI product import** from supercoreai.co.uk Shopify catalogue

### Phase 3 — Future

- [x] Multi-region pricing (GBP/EUR/USD)
- [ ] ERP / inventory sync (Zoho Books stub: `quote.submitted` subscriber + `metadata.erp` fields)
- [ ] Zendesk or helpdesk integration for CARE support tickets
- [ ] CI/CD + production deployment (Vercel storefront, hosted Medusa)

---

## 7. Key configuration files

| File | Purpose |
|---|---|
| `apps/storefront/.env` | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, backend URL |
| `apps/backend/.env` | Database, Redis, Typesense, secrets |
| `apps/storefront/next.config.js` | Image domains (BigCommerce CDN, localhost) |
| `docker-compose.yml` | Full dev stack |

---

## 8. Commands

```powershell
# Full stack
docker compose up --build -d

# Logs
docker compose logs -f storefront
docker compose logs -f medusa

# Admin user
docker compose exec medusa sh -c "cd /server/apps/backend && pnpm medusa user -e admin@supercore.local -p SuperCoreAdmin1!"

# Multi-region pricing (GBP/EUR/USD) on an existing database
docker compose exec medusa sh -c "cd /server/apps/backend && pnpm exec medusa exec ./src/scripts/backfill-multi-region-pricing.ts"

# Host-side dev (requires Node 20+)
pnpm run dev
pnpm run storefront:dev
pnpm run backend:dev
```

---

## 9. Content editing guide

| What to change | File |
|---|---|
| Brand name, phone, email, logo | `apps/storefront/src/lib/brand.ts` |
| Homepage hero, services, categories | `apps/storefront/src/lib/home-content.ts` |
| Navigation menus & sub-menus | `apps/storefront/src/lib/site-navigation.ts` |
| Products mega menu (Medusa tree) | `apps/storefront/src/lib/mega-menu/catalog-nav.ts` |
| Mega menu components | `apps/storefront/src/modules/layout/components/mega-menu/` |
| Marketing page copy | `apps/storefront/src/lib/site-pages/registry.ts` |
| Medusa category tree | `apps/backend/src/migration-scripts/supercore-category-tree.ts` |
| Seed products / run seed | `apps/backend/src/migration-scripts/initial-data-seed.ts` |
| Multi-region pricing (existing DB) | `apps/backend/src/scripts/backfill-multi-region-pricing.ts` |
| Colors / fonts | `tailwind.config.js`, `globals.css`, `app/layout.tsx` |

---

## 10. Related documents

- `docs/master/NAVIGATION-MENU.md` — Full navigation menu, categories, collections, homepage sections
- `docs/master/SUPERCORE-CATEGORIES.md` — Master taxonomy (Products, Engineering, Markets, Company)
- `docs/master/B2B-QUOTE-ADMIN.md` — B2B quote admin panel, API, Zoho Books extensibility
- `docs/README.md` — Doc index and `.docx` export command
- `AGENTS.md` — Agent conventions for this monorepo
- `D:\Programs\Supercore - Categories.docx` — Master category taxonomy (Products, Markets, Engineering, Company) with ecommerce routes
- Desktop `Project Structure.docx` — Prior planning notes (superseded by this document)
