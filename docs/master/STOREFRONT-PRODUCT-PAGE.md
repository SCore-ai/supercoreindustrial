# Storefront Product Detail Page (PDP)

**Version:** 1.2  
**Last updated:** 25 August 2026  
**Maintainers:** Edit this `.md` first, then regenerate `.docx` (see §10).

**Related docs:** `PROJECT-STRUCTURE.md` (§3.6), `B2B-QUOTE-ADMIN.md` (tier pricing, quotes)

---

## 1. Overview

The industrial product detail page (`/{countryCode}/products/{handle}`) is optimised for B2B buyers: part numbers, variant matrices, quote-gated SKUs, VAT display, and rich metadata-driven specifications.

**Reference UX:** supercoreai.co.uk, netcamcenter.com, industrialnetworking.com — orange/gold CTA (`#FFB700`), dark charcoal text, spec-first layout.

| URL example | Product |
|---|---|
| `/gb/products/eds-305-explosion-protected-camera` | EDS-305 matrix demo (18 variants) |

---

## 2. Page layout (INS-inspired)

```
Breadcrumbs
Jump nav: Models | Details | Documentation | Related | Request Quote
┌─────────────────────────────┬──────────────────────────┐
│  Gallery (portrait 5:6)     │  Buy box (sticky)        │
│  vertical thumbs + zoom       │  Manufacturer (caps)     │
│                               │  H1 title                │
│                               │  Part # + In Stock       │
│                               │  Variant dropdowns       │
│                               │  Qty stepper (+/−)       │
│                               │  Now: price excl/incl VAT│
│                               │  Add to Cart | Quote     │
│                               │  Reset | Specs & Docs    │
└─────────────────────────────┴──────────────────────────┘
Commonly purchased with: (INS card grid — manufacturer, part #, Now price)
Configuration matrix (when matrix mode) — id="models"
Details | Documentation | Support (scroll-spy sections)
Request Quote banner (full-width CTA strip)
```

### 2.1 Key files

| Path | Purpose |
|---|---|
| `apps/storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx` | Route, metadata, variant image filter (`?v_id=`) |
| `apps/storefront/src/modules/products/templates/index.tsx` | Page shell, jump nav, 2-col hero |
| `apps/storefront/src/modules/products/components/product-jump-nav/` | Sticky jump-to-section nav |
| `apps/storefront/src/modules/products/components/product-gallery-enhanced/` | Multi-image gallery + zoom (5:6 aspect) |
| `apps/storefront/src/modules/products/components/product-actions/` | INS buy box (client) |
| `apps/storefront/src/modules/products/components/product-actions/option-select.tsx` | `<select>` variant dropdowns |
| `apps/storefront/src/modules/products/components/product-quantity-stepper/` | +/- qty control |
| `apps/storefront/src/modules/products/components/product-specs-quick/` | Specs & Docs quick strip |
| `apps/storefront/src/modules/products/components/product-vat-price/` | Now / Was / Save + excl/incl VAT |
| `apps/storefront/src/modules/products/components/product-quote-banner/` | Bottom Request Quote strip |
| `apps/storefront/src/modules/products/components/product-content/` | Details / Documentation sections |
| `apps/storefront/src/modules/products/components/variant-matrix/` | Full SKU matrix table |
| `apps/storefront/src/modules/products/components/related-products/` | INS-style related cards |
| `apps/storefront/src/lib/util/product-page-content.ts` | Metadata parser + jump sections |

---

## 3. Image gallery

### 3.1 Multi-image UX

- **Desktop:** vertical thumbnail rail (left) + main stage (right)
- **Mobile:** main image + horizontal thumbnail strip; swipe left/right to change image
- **Navigation:** prev/next arrows on hover; keyboard ← → ; image counter badge
- **Variant images:** filtered by `?v_id=` query param when variant has linked images

### 3.2 Zoom

| Mode | Behaviour |
|---|---|
| Hover magnifier (desktop) | 2.5× lens + live preview pane (pointer: fine only) |
| Click / tap | Opens fullscreen lightbox |
| Lightbox | Scroll or +/- to zoom 100%–400%; drag to pan; double-click toggles 2×; thumbnail strip; Escape to close |

**Component files:**

- `product-gallery-enhanced/index.tsx` — stage + thumbnails
- `product-gallery-enhanced/gallery-lightbox.tsx` — fullscreen zoom

---

## 4. Purchase panel (right column)

Field order (top to bottom):

| Field | Source |
|---|---|
| Product title | `product.title` |
| Manufacturer | `metadata.manufacturer` or `metadata.brand` |
| Model | `metadata.model` or `metadata.family` |
| SKU | Selected variant `sku` (matrix: parent SKU or “Multiple SKUs — see matrix”) |
| Variant selector | Medusa `product.options` (`<select>` dropdowns, “Required” label) |
| Qty | Stepper with +/− buttons (min 1) |
| Price | **Now:** excl. VAT (large) + **incl. {vat_rate}% VAT**; optional Was/Save on sale |
| Short description | `metadata.short_description` |
| Add to cart | Primary gold CTA |
| Buy now | Add to cart → redirect to `/checkout` |
| Quote request | Add to quote → `/quote` |
| Stock status | In stock / Low stock / Out of stock / Backorder |
| Courier delivery | `metadata.courier_delivery` |

### 4.1 B2B pricing integration

- **Guest price hiding:** from B2B settings → “Sign in for pricing”
- **Tier pricing:** logged-in trade accounts → `/store/b2b/pricing` overrides unit price on PDP
- **Quote-only variants:** no resolved price → Quote request as primary CTA

### 4.2 Matrix mode

Triggered when `metadata.display === "matrix"` **or** ≥2 options and ≥4 variants (`lib/util/variant-matrix.ts`).

- Purchase panel shows manufacturer/model/SKU + message to use matrix below
- Full-width **Configuration matrix** table: options, Part #, MPN, price, stock, qty, cart/quote per row

**Demo product:** `apps/backend/src/lib/seed/eds-305-product.ts` — handle `eds-305-explosion-protected-camera`

---

## 5. Product metadata schema

Store rich PDP content in Medusa **product metadata** (JSON strings for arrays/objects):

```json
{
  "manufacturer": "Supercore Systems",
  "model": "EDS-305",
  "brand": "Supercore Systems",
  "family": "EDS-305",
  "short_description": "One-line summary for the purchase panel.",
  "courier_delivery": "Courier delivery: UK express 2–3 business days…",
  "vat_rate": 20,
  "category_label": "Explosion-Protected Cameras",
  "certifications": ["ATEX Zone 1", "IECEx", "UKCA"],
  "highlights": [
    { "label": "Resolution", "value": "1080p HDTV" },
    { "label": "Zoom", "value": "40× optical" }
  ],
  "features": ["Feature bullet one", "Feature bullet two"],
  "specifications": {
    "Imaging": {
      "Resolution": "1920 × 1080",
      "Optical zoom": "40×"
    },
    "Environmental": {
      "Operating temperature": "-20°C to +50°C"
    }
  },
  "documents": [
    { "name": "Datasheet", "url": "https://…", "type": "pdf" }
  ],
  "shipping_notes": "Handling time: ships next business day…",
  "video_url": "https://www.youtube.com/embed/…",
  "display": "matrix"
}
```

**Parser:** `getProductPageContent()` in `apps/storefront/src/lib/util/product-page-content.ts`

---

## 6. Content sections (below fold)

Sticky horizontal nav with scroll-spy:

| Section | Content |
|---|---|
| Description | `product.description` + optional `video_url` embed |
| Features | `metadata.features` bullet grid |
| Specifications | Grouped tables from `metadata.specifications` + core Medusa fields |
| Documents | Download table from `metadata.documents` |
| Shipping | `metadata.shipping_notes` + quote CTA |

---

## 7. Related products

**Label:** “Commonly purchased with:”

**Card layout (INS-style):** manufacturer (uppercase), title, Part #, “Now:” price, “See options →” link.

**Logic:** same collection + shared tags, exclude current product (`related-products/index.tsx`).

Placed directly under the hero grid (gallery + buy box), anchor id `related`.

---

## 8. Design tokens (PDP)

| Token | Value | Usage |
|---|---|---|
| `--sc-cta` | `#FFB700` | Add to cart, accents |
| `--sc-cta-hover` | `#E6A500` | Button hover |
| `--sc-body` | `#0A0A0A` | Body text, links |
| `--sc-ink` | `#0A1628` | Headings |

Defined in `apps/storefront/src/styles/globals.css` and `tailwind.config.js`.

---

## 9. Admin workflow

1. Create/publish product in Medusa Admin with images (multiple allowed).
2. Set variants, SKUs, MPN in variant metadata (`mpn`).
3. Paste metadata JSON fields for manufacturer, short description, specs, documents.
4. For matrix products: set `display: matrix` and configure options/variants.
5. Verify on storefront: `/gb/products/{handle}`.

---

## 10. Document maintenance

**Regenerate Word copy** (requires Microsoft Word on Windows, from repo root):

```powershell
$master = "docs/master"
& scripts/export-md-to-docx.ps1 -InputPaths @(
  "$master/STOREFRONT-PRODUCT-PAGE.md"
) -OutputDirs @($master)
```

Or export **all** master docs:

```powershell
& scripts/export-all-docs.ps1
```

**When to update:**

- New PDP field or metadata key → §5 + §4 table
- Gallery or zoom behaviour change → §3
- New component path → §2.1
- Release → bump **Version** in header; add row to changelog (§11)

---

## 11. Changelog

| Date | Version | Summary |
|---|---|---|
| 25 Aug 2026 | 1.2 | INS-inspired layout: jump nav, buy box dropdowns, qty stepper, Now/Was pricing, related cards, quote banner |
| 9 Aug 2026 | 1.1 | Purchase panel field order (Manufacturer→Courier); gallery lightbox zoom/pan |
| 9 Aug 2026 | 1.0 | Industrial PDP: multi-image gallery with zoom, purchase panel, metadata schema, matrix mode, commonly purchased with |
