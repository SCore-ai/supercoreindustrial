# Supercore Industrial — Documentation

Master project documentation lives in **`docs/master/`** (revision **v1.10**, 9 August 2026).

Each document is kept in **Markdown + Word** (`.md` + `.docx`) in `docs/master/`.

| Document | Description |
|---|---|
| [PROJECT-STRUCTURE.md](./master/PROJECT-STRUCTURE.md) | Repository architecture, phases, commands |
| [NAVIGATION-MENU.md](./master/NAVIGATION-MENU.md) | Full site navigation, homepage, catalog mapping |
| [SUPERCORE-CATEGORIES.md](./master/SUPERCORE-CATEGORIES.md) | Master taxonomy: Products, Engineering, Markets, Company |
| [B2B-QUOTE-ADMIN.md](./master/B2B-QUOTE-ADMIN.md) | B2B Module: admin panel, API, backlog & project tracking |
| [STOREFRONT-PRODUCT-PAGE.md](./master/STOREFRONT-PRODUCT-PAGE.md) | Industrial PDP: gallery, zoom, purchase panel, metadata |
| [STOREFRONT-B2B-ACCOUNT.md](./master/STOREFRONT-B2B-ACCOUNT.md) | Trade portal: quotes, messages, conversations UI |

**Regenerate all `.docx` after editing `.md`:**

```powershell
& scripts/export-all-docs.ps1
```

**Or export selected files:**

```powershell
$master = "docs/master"
& scripts/export-md-to-docx.ps1 -InputPaths @(
  "$master/PROJECT-STRUCTURE.md",
  "$master/NAVIGATION-MENU.md",
  "$master/SUPERCORE-CATEGORIES.md",
  "$master/B2B-QUOTE-ADMIN.md",
  "$master/STOREFRONT-PRODUCT-PAGE.md",
  "$master/STOREFRONT-B2B-ACCOUNT.md",
  "$master/README.md"
) -OutputDirs @($master)
```

Requires **Microsoft Word** on Windows (COM automation).

**Source of truth (code):**

- Navigation: `apps/storefront/src/lib/site-navigation.ts`
- Product PDP: `apps/storefront/src/modules/products/`
- Trade portal: `apps/storefront/src/app/[countryCode]/(main)/account/@dashboard/trade/`
- B2B data layer: `apps/storefront/src/lib/data/b2b-account.ts`
- B2B admin: `apps/backend/src/admin/routes/b2b/`
- Category seed tree: `apps/backend/src/lib/seed/supercore-category-tree.ts`
