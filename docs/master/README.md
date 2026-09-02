# Master Documentation — Supercore Industrial Systems Ltd

**Version:** 1.10  
**Last updated:** 9 August 2026

This folder is the canonical documentation set for the Supercore Industrial ecommerce platform.

Each document is maintained in **both Markdown (`.md`) and Word (`.docx`)** — edit the `.md` source, then run the export script to regenerate the matching `.docx`.

| File | Format | Purpose |
|---|---|---|
| `PROJECT-STRUCTURE.md` | Markdown + `.docx` | Monorepo layout, Docker, phases, editing guide |
| `NAVIGATION-MENU.md` | Markdown + `.docx` | Mega menu, footer, mobile nav, homepage sections |
| `SUPERCORE-CATEGORIES.md` | Markdown + `.docx` | Full product taxonomy + Engineering + Markets + Company |
| `B2B-QUOTE-ADMIN.md` | Markdown + `.docx` | B2B Module: admin, API, backlog & project tracking |
| `STOREFRONT-PRODUCT-PAGE.md` | Markdown + `.docx` | Industrial product detail page: gallery, zoom, purchase panel |
| `STOREFRONT-B2B-ACCOUNT.md` | Markdown + `.docx` | Trade portal: quotes, messages, conversations UI |
| `README.md` | Markdown + `.docx` | This index |

**Regenerate all `.docx` files** (from repo root; requires Microsoft Word):

```powershell
& scripts/export-all-docs.ps1
```

**Recent changes (v1.10):**

- New `STOREFRONT-B2B-ACCOUNT.md` — P1-1 conversations UI, trade routes, store API, testing checklist
- `PROJECT-STRUCTURE.md` — trade portal routes; v1.10
- `B2B-QUOTE-ADMIN.md` — P1-1 marked Done; changelog v2.6
- `STOREFRONT-PRODUCT-PAGE.md` — purchase panel field order, gallery zoom (v1.1)

**Prior (v1.9):**

- New `STOREFRONT-PRODUCT-PAGE.md` — multi-image gallery with zoom, purchase panel, metadata schema, matrix mode
- `scripts/export-all-docs.ps1` — one-command export for all master docs
- Export script heading accent updated to brand gold (`#FFB700`)

External reference: `D:\Programs\Supercore - Categories.docx` (original planning document).
