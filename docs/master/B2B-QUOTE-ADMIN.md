# Supercore Industrial — B2B Module & Quote Admin

**Version:** 2.12.0  
**Last updated:** 25 August 2026  
**Documentation folder:** `docs/master/`  
**Maintainers:** Update this `.md` first, then regenerate `.docx` (see §12).  
**Related:** Storefront `/quote`, `apps/backend/src/modules/b2b/`, `apps/backend/src/modules/quote/`

---

## 0. Project status dashboard

**Overall completion (estimate):**

| Area | Done | Notes |
|---|---|---|
| Admin merchant panel (B2B Module UI) | ~90% | All 8 sidebar items live; Groups CRUD + company/customer assignment |
| Backend API & data model | ~70% | Core modules + workflows; group assign syncs Medusa customers |
| Storefront B2B customer experience | ~68% | Quote, registration, portal, team invite/roles, bulk order |
| ERP automation (Zoho) | ~35% | Offer send sync; full lifecycle pending |
| Market B2B suite parity | ~45% | See backlog §11 |

**Current phase:** Catalogue finish + remaining P1 (lists, visibility rules).

**Last milestone (25 Aug 2026):**

- **Bulk order (P1-5)** — storefront SKU grid + CSV upload to quote cart; guarded by `bulk_order_form_enabled`
- **Offer PDF (P1-9)** — branded commercial offer (Montserrat + Open Sans); admin + trade portal download; attached when a priced offer is emailed
- **Subaccount invite/roles (P1-2)** — storefront Team page; admin/store invite emails; role/status management
- **Groups admin CRUD (P1-10)** — create/rename/delete Medusa groups; assign companies; customer add/remove

---

## 1. Overview

B2B Module connects the storefront **add to quote / submit** flow with the **Medusa Admin** panel. Merchants review quote requests, manage trade accounts (companies), send priced offers, track conversations, configure tiered pricing, and sync to **Zoho Books** where configured.

| Surface | URL / path | Purpose |
|---|---|---|
| Storefront quote cart | `/{countryCode}/quote` | Customer builds and submits quote |
| Medusa Admin — B2B | `/app/b2b/*` | Full B2B Module (see §3.1) |
| Medusa Admin — Offers detail | `/app/b2b/offers/:id` | Quote detail + offer editor + ERP panel |
| Order detail widget | `/app/orders/:id` | Linked quote when `order_id` is set |

Legacy **Orders → Quote requests** routes remain in codebase but are hidden (`link: false`). Use **B2B → Offers**.

---

## 2. Implemented modules & features

### 2.1 Backend modules

| Module | Path | Models | Status |
|---|---|---|---|
| **B2B** | `apps/backend/src/modules/b2b/` | `b2b_company`, `b2b_company_member`, `b2b_conversation`, `b2b_message`, `b2b_order_approval`, `b2b_pricing_tier` | Done |
| **Quote** | `apps/backend/src/modules/quote/` | `quote`, `quote_line_item` | Done |
| **Security** | `apps/backend/src/modules/security/` | `security_settings`, `audit_log` | Done (RBAC, audit, store+admin MFA, SSO) |

### 2.2 Admin UI — B2B Module menu

| Menu | Route | Feature | Status |
|---|---|---|---|
| Dashboard | `/b2b/dashboard` | KPIs, pending registrations, alert cards | Done |
| Settings | `/b2b/settings` | Feature toggles, registration mode, Zoho env guide | Done (persisted) |
| Groups | `/b2b/groups` | Create/rename/delete Medusa groups; assign companies | Done |
| Group Rules | `/b2b/pricing-tiers` | Tiered pricing CRUD | Done (admin) |
| Customers | `/b2b/companies` | Trade accounts, approve/reject, members | Done |
| Reports | `/b2b/reports` | Quote funnel + ops metrics | Done |
| Conversations | `/b2b/conversations` | Admin messaging | Done (admin only) |
| Offers | `/b2b/offers` | Quote list + priced offer send | Done |
| Order approvals | `/b2b/order-approvals` | Subaccount order queue | Done (hidden from sidebar) |

### 2.3 Storefront (customer)

| Feature | Path / component | Status |
|---|---|---|
| Quote cart | `/{country}/quote` | Done |
| Add to Quote (PDP / variant matrix) | `variant-matrix`, quote module | Done |
| Quote submit (email, company, project) | `submit-quote-form` | Done (creates/updates `b2b_company`) |
| Trade registration form | `/{country}/register-trade` | Done (respects `registration_mode`) |
| B2B settings-driven nav | nav, footer, PDP | Partial (quotes/register links, hide guest prices) |
| Contact-for-pricing products | `product-price` | Done |
| B2B account portal | `/{country}/account/trade/*` | Done (quotes, messages, approvals, team) |
| Tier/group pricing display | PDP + cart | Done |
| Conversations UI | `/account/trade/messages` | Done (portal thread + reply) |
| Order approval status | `/account/trade/approvals` | Done (approver approve/reject) |
| Subaccount invite / roles | `/account/trade/team` | Done (admin/primary invite + role/status) |
| Offer PDF | `/account/trade/quotes/:id` | Done (priced offers; Montserrat/Open Sans) |
| Bulk order form | `/{country}/bulk-order` | Done (SKU grid + CSV → quote cart; feature flag) |
| Email MFA (trade login) | `/account` sign-in | Done (when System → Security MFA is on) |
| Admin MFA (email OTP) | Medusa Admin `/app` | Done (when Require admin MFA is on + B2B SMTP) |
| Enterprise SSO | `/account` + `/account/sso/callback` | Done (Medusa auth provider / OIDC env) |

### 2.4 Workflows & subscribers

| Flow | Trigger | Status |
|---|---|---|
| Quote submit | Storefront `POST …/submit` | Done |
| Quote offer send | Admin Offers | Done |
| Zoho Books sync on offer | `quote.offer.sent` | Done (when env configured) |
| Zoho on quote submit | `quote.submitted` | Stub (logs only) |
| Order approval queue | `order.placed` | Done |
| Company approve/reject | Admin Customers | Done |
| Company approved hook | `b2b.company.approved` | Done (email + group assign) |
| Subaccount invite | Store Team + admin Add customer | Done |

### 2.5 API routes (summary)

**Store:**

| Method | Route | Purpose | Status |
|---|---|---|---|
| POST/GET/PATCH | `/store/quotes/*` | Quote cart lifecycle | Done (guarded by `quotes_enabled`) |
| POST | `/store/quotes/:id/bulk-line-items` | Bulk SKU/CSV import to quote cart | Done (guarded by `quotes_enabled` + `bulk_order_form_enabled`) |
| GET | `/store/b2b/settings` | Storefront feature flags | Done |
| POST | `/store/b2b/register` | Dedicated trade registration | Done |
| GET/POST | `/store/b2b/pricing` | Tier price lookup (+ batch POST) | Done (guarded) |
| POST | `/store/carts/:id/b2b-pricing` | Apply tier prices to cart line items | Done (auth) |
| GET/POST | `/store/b2b/conversations` | Messaging | Done (auth + guarded) |
| GET | `/store/b2b/account` | Trade account summary | Done (auth) |
| GET | `/store/b2b/quotes` | Customer quote list | Done (auth) |
| GET | `/store/b2b/quotes/:id` | Quote detail + offer lines | Done (auth) |
| GET | `/store/b2b/quotes/:id/pdf` | Branded offer PDF (priced / quoted or won) | Done (auth + company scope) |
| GET | `/store/b2b/order-approvals` | Company approval queue | Done (auth) |
| GET | `/store/b2b/auth-options` | MFA/SSO flags for login | Done |
| POST | `/store/b2b/mfa/challenge` | Email OTP for trade login | Done (when MFA enabled) |
| POST | `/store/b2b/mfa/verify` | Confirm MFA code | Done |
| GET/POST/DELETE | `/store/b2b/members*` | Subaccount invite, roles, disable/remove | Done (auth, admin/primary + RBAC) |

**Admin:**

| Method | Route | Purpose | Status |
|---|---|---|---|
| GET | `/admin/b2b/dashboard` | Dashboard stats | Done |
| CRUD | `/admin/b2b/companies/*` | Trade accounts + members | Done |
| CRUD | `/admin/b2b/pricing-tiers/*` | Group rules | Done |
| CRUD | `/admin/b2b/conversations/*` | Messaging | Done |
| GET/PATCH | `/admin/b2b/quotes/:id` | Quote workflow (Won auto-converts) | Done |
| POST | `/admin/b2b/quotes/:id/convert` | Quote → Medusa order | Done |
| POST | `/admin/b2b/quotes/:id/offer` | Send priced offer | Done |
| GET | `/admin/b2b/quotes/:id/pdf` | Download branded offer PDF | Done |
| POST | `/admin/b2b/quotes/:id/integration` | ERP metadata | Done |
| GET/PATCH | `/admin/b2b/settings` | Module settings CRUD | Done |
| GET/PATCH | `/admin/b2b/order-approvals/*` | Order approval | Done |
| GET/PATCH | `/admin/system/security` | Security settings + posture | Done |
| GET | `/admin/system/mfa/status` | Admin MFA cookie/session status | Done |
| POST | `/admin/system/mfa/challenge` | Email a 6-digit admin MFA code | Done |
| POST | `/admin/system/mfa/verify` | Confirm admin MFA and set cookie | Done |

---

## 3. Storefront flow (customer)

1. Customer adds products via **Add to Quote** on PDP or catalog.
2. Quote cart persists in cookie + Medusa `quote` module (`status: draft`).
3. Customer opens `/quote`, reviews lines, selects region (GBP / EUR / USD).
4. Customer submits contact details → `POST /store/quotes/:id/submit`.
5. Quote status becomes `submitted`; `metadata.admin_status` is set to `new`.
6. `b2b_company` is created or updated via `upsertCompanyFromQuote`.
7. Event `quote.submitted` is emitted.
8. After a priced offer (`quoted` / `won`), the customer downloads the PDF from quote detail via Next.js `GET /api/b2b/quotes/:id/pdf` (proxies Medusa `/store/b2b/quotes/:id/pdf`).

**Store API routes:**

| Method | Route | Purpose |
|---|---|---|
| POST | `/store/quotes` | Create draft quote |
| GET | `/store/quotes/:id` | Retrieve quote + line items |
| PATCH | `/store/quotes/:id` | Update `region_id` |
| POST | `/store/quotes/:id/submit` | Submit with email, company, project, notes |
| POST | `/store/quotes/:id/line-items` | Add line item |
| POST | `/store/quotes/:id/bulk-line-items` | Bulk add from SKU rows or CSV |
| PATCH | `/store/quotes/:id/line-items/:lineId` | Update quantity |
| DELETE | `/store/quotes/:id/line-items/:lineId` | Remove line |

---

## 4. Admin panel (merchant)

Admin extensions live under `apps/backend/src/admin/` (custom Medusa admin routes, not a WordPress plugin).

### 4.1 Navigation (B2B Module v2.0)

**B2B** top-level menu with nested sidebar items (click parent to expand):

| # | B2B Module | Medusa Admin route | Description |
|---|---|---|---|
| 1 | Dashboard | `/b2b/dashboard` | Sales summary, pending registrations, alert cards |
| 2 | Settings | `/b2b/settings` | Feature toggles, Zoho env vars |
| 3 | Groups | `/b2b/groups` | Create/rename/delete Medusa groups; assign companies |
| 4 | Group Rules | `/b2b/pricing-tiers` | Tiered pricing rules |
| 5 | Customers | `/b2b/companies` | Trade account CRM table |
| 6 | Reports | `/b2b/reports` | Quote/customer/ops metrics |
| 7 | Conversations | `/b2b/conversations` | B2B messaging |
| 8 | Offers | `/b2b/offers` | Quote requests + priced offers |

---

## 5. Data model

### 5.1 Quote module (`src/modules/quote/`)

| Model | Fields (key) |
|---|---|
| `quote` | `status` (draft \| submitted), `email`, `company`, `project`, `notes`, `region_id`, `customer_id`, `company_id`, `metadata` |
| `quote_line_item` | `quote_id`, `variant_id`, `product_id`, `quantity`, `sku`, `mpn`, `title`, `metadata` |

### 5.2 B2B module (`src/modules/b2b/`)

| Model | Fields (key) |
|---|---|
| `b2b_company` | `name`, `email`, `status`, `customer_group_id`, `require_order_approval`, VAT/reg fields |
| `b2b_company_member` | `company_id`, `customer_id`, `role` (admin \| buyer \| approver), `is_primary` |
| `b2b_pricing_tier` | `customer_group_id`, `variant_id`, qty range, `unit_price`, `discount_percent` |
| `b2b_conversation` | `company_id`, `quote_id`, `status`, subject |
| `b2b_message` | `conversation_id`, `body`, `sender_type` |
| `b2b_order_approval` | `order_id`, `company_id`, `status` (pending \| approved \| rejected) |
| `b2b_settings` | Feature flags, registration mode, storefront options (singleton row) |

### 5.3 Quote metadata (`quote.metadata`)

```json
{
  "admin_status": "in_review",
  "order_id": "order_01...",
  "admin_notes": "Internal note for sales team",
  "offer": {
    "currency_code": "gbp",
    "valid_until": "2026-09-01",
    "line_items": []
  },
  "erp": {
    "provider": "zoho_books",
    "sync_status": "synced",
    "quote_request_id": "ZOHO_ESTIMATE_ID",
    "sales_order_id": null,
    "purchase_order_id": null
  }
}
```

**Admin status values:** `new`, `in_review`, `quoted`, `won`, `lost`, `cancelled`

**ERP sync status values:** `not_configured`, `pending`, `synced`, `failed`

---

## 6. Backend file map

```
apps/backend/src/
├── modules/
│   ├── b2b/                    # Company, members, tiers, conversations, approvals
│   └── quote/                  # Quote cart + line items
├── admin/
│   ├── routes/b2b/           # Dashboard, Settings, Groups, … Offers
│   ├── routes/orders/quote-requests/  # Legacy (hidden sidebar)
│   ├── components/b2b/       # Shared UI (shell, KPI, offer editor)
│   └── widgets/order-quote-request.tsx
├── api/
│   ├── admin/b2b/            # All admin B2B endpoints
│   └── store/
│       ├── quotes/           # Storefront quote API
│       └── b2b/              # Pricing + conversations
├── workflows/
│   ├── b2b/                  # Approve/reject company & order approval
│   └── quote/                # Submit, offer, update, line items
├── subscribers/
│   ├── order-placed-b2b.ts
│   ├── quote-offer-sent.ts   # Zoho sync
│   ├── quote-submitted.ts
│   └── b2b-company-approved.ts
└── lib/b2b/
    ├── zoho-books-client.ts
    ├── zoho-sync.ts
    ├── medusa-integrations.ts
    └── enrich-admin-quote.ts
```

---

## 7. Events & Zoho Books

### 7.1 Events

| Event | When | Subscriber | Status |
|---|---|---|---|
| `quote.submitted` | Customer submits quote | `quote-submitted.ts` | Stub |
| `quote.offer.sent` | Admin sends priced offer | `quote-offer-sent.ts` | Zoho sync when configured |
| `order.placed` | Checkout complete | `order-placed-b2b.ts` | Order approval queue |
| `b2b.company.approved` | Admin approves company | `b2b-company-approved.ts` | Stub |

### 7.2 Zoho Books

| Medusa concept | Zoho entity | Status |
|---|---|---|
| Priced offer sent | Estimate | Done (auto on `quote.offer.sent`) |
| Won quote → order | Sales Order | Planned |
| Procurement | Purchase Order | Planned |

**Env vars** (`apps/backend/.env.template`):

- `ZOHO_BOOKS_ENABLED=true`
- `ZOHO_BOOKS_CLIENT_ID`, `ZOHO_BOOKS_CLIENT_SECRET`, `ZOHO_BOOKS_REFRESH_TOKEN`
- `ZOHO_BOOKS_ORGANIZATION_ID`

---

## 8. Merchant workflow

1. Customer submits quote on storefront → **B2B → Dashboard** shows pending registration.
2. Sales opens **B2B → Offers**; new entry shows **Admin status: New**.
3. Approve trade account under **B2B → Customers**; assign Medusa customer group.
4. Review line items; set status **In review** → send priced offer from offer detail.
5. Zoho estimate created automatically when Zoho is configured.
6. Mark **Won** to auto-create a Medusa order (or use **Convert to order**); order links on quote and order detail widget.
7. Mark **Won** or **Lost** when deal closes.

**Order approval:** Subaccount buyers on companies with `require_order_approval` trigger pending approval on checkout. Manage via **B2B → Order approvals** (direct URL; not in sidebar).

---

## 9. Commands

Restart backend after admin extension changes:

```powershell
docker compose restart medusa
# or
pnpm run backend:dev
```

Admin URL: http://localhost:9000/app → **B2B**

---

## 10. Related documents

- `PROJECT-STRUCTURE.md` — Monorepo layout and phases
- `NAVIGATION-MENU.md` — Storefront `/quote` and contact routes
- `STOREFRONT-B2B-ACCOUNT.md` — Trade portal + conversations UI (P1-1)
- `AGENTS.md` — Medusa conventions (workflows, admin extensions)

---

## 11. Backlog & work tracking

Update task status here when work completes: `Not started` → `In progress` → `Done`.

### P0 — Launch critical

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| P0-1 | Storefront B2B account portal (quotes, messages, approval status) | Done | | `/account/trade/*` |
| P0-2 | Wire tier pricing API to PDP / cart / checkout | Done | | PDP + cart apply route |
| P0-3 | Quote → Order conversion (Won + create Medusa order) | Done | | `POST .../convert` + Won PATCH |
| P0-4 | Email notifications (registration, offer, order approval) | Done | | SMTP via nodemailer + Settings toggles |
| P0-5 | Dedicated trade registration page (not only quote submit) | Done | | `/{country}/register-trade` |
| P0-6 | Persist Settings feature toggles (DB or config) | Done | | Admin UI + storefront guards |

### P1 — B2B parity

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| P1-1 | Storefront conversations UI | Done | | List, thread, new message, quote-linked messaging |
| P1-2 | Subaccount self-service (invite, roles) | Done | | `/account/trade/team`; invite email + password setup |
| P1-3 | Storefront order approval for approvers | Done | | Store approve/reject API + trade portal actions |
| P1-4 | Purchase lists | Not started | | Marked Planned in Settings |
| P1-5 | Bulk order form / CSV upload | Done | | `/{country}/bulk-order`; POST bulk-line-items |
| P1-6 | Product visibility by customer group | Not started | | |
| P1-7 | Min/max quantity rules by group | Not started | | |
| P1-8 | Payment method restrictions by group | Not started | | |
| P1-9 | Offer PDF export | Done | | Branded Montserrat/Open Sans PDF; admin + trade portal download; attached on offer email |
| P1-10 | Groups admin CRUD (create/link Medusa groups) | Done | | Groups page + company/customer assignment; members sync |

### P2 — Enterprise

| ID | Task | Status | Owner | Notes |
|---|---|---|---|---|
| P2-1 | Credit limit & net payment terms | Not started | | |
| P2-2 | Tax / VAT exemption profiles | Not started | | |
| P2-3 | Dynamic rules engine (BOGO, shipping, coupons) | Not started | | |
| P2-4 | Sales rep assignment per company | Not started | | |
| P2-5 | Zoho full lifecycle (SO/PO automation) | Not started | | |
| P2-6 | Multi-currency price lists | Not started | | |
| P2-7 | Saved / shared carts for subaccounts | Not started | | |
| P2-8 | Quick order pad (SKU entry) | Not started | | |
| P2-9 | Reports CSV/PDF export | Not started | | |
| P2-10 | Custom registration fields | Not started | | |
| P2-11 | Storefront role enforcement (buyer vs approver) | Not started | | |
| P2-12 | Audit log for B2B entities | Done | | Companies, members, quotes, conversations, order approvals, groups |

### Technical debt

| ID | Task | Status | Notes |
|---|---|---|---|
| T1 | `b2b.company.approved` — email + customer group sync | Done | Approve workflow assigns group; subscriber sends welcome email |
| T2 | Order approval → fulfillment status flow | Not started | |
| T3 | Store conversations auth hardening | Not started | Company scope validation |
| T4 | Show Order approvals in B2B sidebar (optional) | Not started | Currently `link: false` |
| T5 | Align feature flag badges with real module gates | Done | Settings page + route guards |

### Changelog (milestones)

| Date | Version | Summary |
|---|---|---|
| 25 Aug 2026 | 2.12.0 | Bulk order (P1-5): storefront SKU grid + CSV upload; POST `/store/quotes/:id/bulk-line-items`; Settings toggle live |
| 25 Aug 2026 | 2.11.4 | Admin B2B Settings: Company & bank tab (legal name, address, VAT, IBAN, bank, BIC) drives offer PDF CONTACT |
| 25 Aug 2026 | 2.11.3 | Offer PDF: company logo + right-aligned QUOTATION; CONTACT from supercoreai.co.uk; packing-list HS/origin/dims/weight/stock under each line |
| 25 Aug 2026 | 2.11.2 | Offer PDF layout/filename aligned to quotation template (CONTACT, quote meta, IBAN, MODEL column, subtotal/shipping/VAT, addresses); brand colours/fonts unchanged |
| 25 Aug 2026 | 2.11.1 | Storefront offer PDF download: Next `/api` proxy + blob download (parallel-slot `route.ts` did not download) |
| 25 Aug 2026 | 2.11 | Offer PDF (P1-9): branded commercial offer download in admin/storefront; PDF attached to offer-sent email |
| 25 Aug 2026 | 2.10 | Admin MFA: email OTP after Medusa Admin login, HMAC cookie, topbar gate, SMTP-backed challenge |
| 25 Aug 2026 | 2.9 | Security: store RBAC on B2B routes, audit log on mutations, email MFA, SSO login, audit retention job |
| 25 Aug 2026 | 2.8 | Subaccount self-service (P1-2): storefront Team page, invite email, role/status management |
| 25 Aug 2026 | 2.7 | Groups admin CRUD (P1-10): create/rename/delete, company + customer assignment, approve sync (T1) |
| 9 Aug 2026 | 2.6 | Storefront conversations UI (P1-1): messages list, thread replies, new conversation, quote messaging |
| 9 Aug 2026 | 2.5 | Storefront B2B account portal (`/account/trade/*`); store quote/approval/account APIs |
| 9 Aug 2026 | 2.4 | B2B email notifications; Reports analytics UI refresh |
| 9 Aug 2026 | 2.3 | Quote→order conversion workflow; admin Convert button; Won auto-links order |
| 9 Aug 2026 | 2.2 | Tier pricing on PDP/cart/checkout; batch pricing API; cart b2b-pricing route |
| 9 Aug 2026 | 2.1 | B2B Settings persisted; admin settings UI; storefront trade registration + feature guards |
| 9 Aug 2026 | 2.0 | B2B Module sidebar v2.0; dashboard sub-route; B2BKing refs removed; project tracking section added |
| 9 Aug 2026 | 1.9 | Order approval, conversations, tier pricing, Zoho offer sync |
| Earlier | 1.0 | Quote module + admin quote requests |

---

## 12. Document maintenance

**Source of truth:** this Markdown file. Edit here first whenever B2B scope, status, or backlog changes.

**Regenerate Word copy** (requires Microsoft Word on Windows):

```powershell
& scripts/export-all-docs.ps1
```

Or export this file only:

```powershell
$master = "docs/master"
& scripts/export-md-to-docx.ps1 -InputPaths @(
  "$master/B2B-QUOTE-ADMIN.md"
) -OutputDirs @($master)
```

**When to update:**

- Feature shipped or scope changed → §2 status tables + §11 task row
- New API route or model → §5–§6
- Sprint planning → §11 priority/owner columns
- Release → §0 dashboard + §11 changelog row; bump **Version** in header
