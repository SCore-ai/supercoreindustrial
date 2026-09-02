# Supercore Industrial Systems Ltd — Navigation Menu Document

**Version:** 1.7  
**Last updated:** 9 August 2026  
**Revision:** Product category hierarchy v1.6 (see `SUPERCORE-CATEGORIES.md`)
**Documentation folder:** `docs/master/`  
**Source document:** `D:\Programs\Supercore - Categories.docx`  
**Source of truth (code):** `apps/storefront/src/lib/site-navigation.ts`, `apps/storefront/src/lib/mega-menu/catalog-nav.ts`, `apps/backend/src/lib/seed/supercore-category-tree.ts`

---

## 1. Brand & global chrome

| Element | Value |
|---|---|
| Legal name | Supercore Industrial Systems Ltd |
| Short name | Supercore |
| Tagline | Industrial systems for hazardous and marine environments |
| Website | https://supercoreai.co.uk |
| Sales email | sales@supercore.local |
| Phone | +44 (0)1224 000000 |

### Logos

| Context | Asset | Path |
|---|---|---|
| Header (light background) | Stacked logo — yellow mark | `/brand/logo-stacked-light.png` |
| Footer (dark background) | Stacked logo — dark variant | `/brand/logo-stacked-dark.png` |
| Horizontal variant | Wide lockup | `/brand/logo-horizontal-dark.png` |

### Announcement bar

- Message: new Supercore Industrial Systems Ltd storefront; returning customers → **Account** (set password)
- Dismissible (×)

### Header utilities (right side)

| Item | Route | Notes |
|---|---|---|
| **Region** | `/{countryCode}/…` | Desktop header dropdown — flag + currency (GBP / EUR / USD); mobile menu footer lists country · currency; switches Medusa region + recalculates prices |
| Search | `/search?q=…` | Placeholder: “Search Part Number, Keyword…”; optional **MPN only** filter; **INS expand** on desktop (click/focus — logo + nav hide, bar fills header ~1.5s; × or Escape closes) |
| Account | `/account` | Login / dashboard |
| Cart | `/cart` | Live Medusa cart |
| **Contact** (dropdown) | See §1.1 | Orange CTA button |

### §1.1 Contact dropdown

| Label | Route / action |
|---|---|
| Contact Us | `/contact-us` |
| Request Quote | `/get-a-quote` |
| Support | `/support` |
| Email Sales | `mailto:sales@supercore.local` |

---

## 2. Primary navigation (desktop mega menu)

Five top-level items. All routes are **country-prefixed** in the browser (e.g. `/gb/all-products`).

### 2.0 Desktop interaction (INS pattern)

Matches [industrialnetworking.com](https://www.industrialnetworking.com/) behaviour:

| Action | Result |
|---|---|
| **Hover** top-level item (Products, Services, …) | Trigger text highlight only — panel does **not** open |
| **Click** top-level item | Toggle mega menu panel open/closed |
| **Click** another top-level item | Switches open panel (only one open at a time) |
| **Click** outside nav / panel | Closes open panel |
| **Escape** | Closes open panel |
| **Hover** left-rail section (Products modes, Services sections) | Switches right-hand content with fade/slide |

**Panel animation:** 300ms slide-down (`translateY(-2rem)` → `0`) + fade — CSS class `.sc-mega-menu-panel`.

**Implementation:** `modules/layout/components/mega-menu/` — `mega-menu-context.tsx`, `mega-menu-trigger.tsx`, `mega-menu-panel-shell.tsx`.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]   Products ▾   Services ▾   Technologies ▾   Company ▾   Support ▾ │
│                                              [Region ▾] [Search] [Account] [Cart] [Contact ▾] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1 Products

**Hub route:** `/store` (live Medusa catalog)  
**Partner catalogue hub:** `/all-products` (marketing landing pages)

Three mega-menu columns: **Supercore Products** | **Partner Catalogue** | **Shop by Brand**

#### Column A — Supercore Products (Medusa categories)

From `Supercore - Categories.docx` → Products. Routes: `/categories/{handle}`.

| # | Category | Route |
|---|---|---|
| 1 | Shop All Products | `/store` |
| 2 | CCTV Systems | `/categories/cctv-systems` |
| 3 | PAGA Systems | `/categories/paga-systems` |
| 4 | Intercom Systems | `/categories/intercom-systems` |
| 5 | Public Address Systems | `/categories/public-address-systems` |
| 6 | Solution Platforms | `/categories/solution-platforms` |
| 7 | Explosion-Protected Devices | `/categories/explosion-protected-devices` |
| 8 | Network audio | `/categories/network-audio` |
| 9 | Access control | `/categories/access-control` |
| 10 | Radar | `/categories/radar` |
| 11 | Video analytics | `/categories/video-analytics` |
| 12 | Hazardous Area | `/categories/hazardous-area` |
| 13 | Safe Area | `/categories/safe-area` |
| 14 | Cables | `/categories/cables` |

#### Column B — Partner Catalogue

Extended connectivity catalogue (marketing routes under `/all-products/`).

| # | Category | Route |
|---|---|---|
| 1 | All Partner Products | `/all-products` |
| 2 | Antennas | `/all-products/antennas` |
| 3 | Cabinetry & Enclosures | `/all-products/cabinetry-enclosures` |
| 4 | Cable Entry Seals | `/all-products/cable-entry-seals` |
| 5 | Cabling | `/all-products/cabling` |
| 6 | Cabling Tools & Testers | `/all-products/cabling-tools-testers` |
| 7 | Cameras & Video | `/all-products/cameras-video` |
| 8 | Cellular Routers & Gateways | `/all-products/cellular-routers-gateways` |
| 9 | Connectors | `/all-products/connectors` |
| 10 | Ethernet Extenders | `/all-products/ethernet-extenders` |
| 11 | Ethernet Switches | `/all-products/ethernet-switches` |
| 12 | Fieldbus Cards & Modules | `/all-products/fieldbus-cards-modules` |
| 13 | IoT Gateways, Computers & Monitors | `/all-products/iot-gateways-computers-monitors` |
| 14 | Industrial I/O | `/all-products/industrial-i-o` |
| 15 | KVM Switches & Extenders | `/all-products/kvm-switches-extenders` |
| 16 | Media Converters | `/all-products/media-converters` |
| 17 | Mounting Hardware | `/mounting-hardware` |
| 18 | Network Management | `/all-products/network-management-software-appliances` |
| 19 | Network Security & Routers | `/all-products/network-security-routers` |
| 20 | Patch Panels | `/all-products/patch-panels` |
| 21 | Power Solutions | `/all-products/power-solutions` |
| 22 | Remote Access | `/all-products/remote-access` |
| 23 | Serial & USB Connectivity | `/all-products/serial-usb-connectivity` |
| 24 | Serial Device Servers & Protocol Converters | `/all-products/serial-device-servers-protocol-converters` |
| 25 | Surge & Lightning Protection | `/all-products/surge-lightning-protection` |
| 26 | Wireless Radios | `/all-products/wireless-radios` |

#### Column C — Shop by Brand

| # | Brand | Route |
|---|---|---|
| 1 | PULS | `/brands/puls` |
| 2 | Belden | `/brands/belden` |
| 3 | ESTeem | `/brands/esteem` |
| 4 | Molex | `/brands/molex` |
| 5 | Ericsson | `/brands/ericsson` |
| 6 | Digi | `/brands/digi` |
| 7 | Adder | `/brands/adder` |
| 8 | Endian | `/brands/endian` |
| 9 | Hirschmann | `/brands/hirschmann` |
| 10 | HMS | `/brands/hms` |
| 11 | DINSpace | `/brands/dinspace` |
| 12 | Moxa | `/brands/moxa` |
| 13 | Dynics | `/brands/dynics` |
| 14 | Cisco | `/brands/cisco` |
| 15 | Beijer Electronics | `/brands/beijer-electronics` |
| 16 | Semtech (Sierra Wireless) | `/brands/semtech` |
| 17 | Kepware | `/brands/kepware` |
| 18 | Inseego | `/brands/inseego` |
| 19 | Ewon | `/brands/ewon` |
| 20 | Rittal | `/brands/rittal` |
| 21 | View All Brands | `/brands` |

---

### 2.2 Services

**Hub route:** `/services`

Three mega-menu columns: **Engineering Services** | **Connectivity & Managed Services** | **Markets We Serve**

#### Column A — Engineering Services

From `Supercore - Categories.docx` → Engineering. **Section hub:** `/offerings`

| # | Service | Route |
|---|---|---|
| 1 | Industrial Communication | `/engineering/industrial-communication` |
| 2 | Information and Security Systems | `/engineering/information-security-systems` |
| 3 | Fire & Gas | `/engineering/fire-gas` |
| 4 | Trace Heating | `/engineering/trace-heating` |
| 5 | Design Scopes / Modifications | `/engineering/design-scopes-modifications` |
| 6 | Electrical / Construction Scopes | `/engineering/electrical-construction-scopes` |
| 7 | Ex Equipment Inspection & Maintenance | `/engineering/ex-equipment-inspection-maintenance` |
| 8 | System Integration | `/engineering/system-integration` |
| 9 | Lighting Maintenance | `/engineering/lighting-maintenance` |
| 10 | Navigational Lighting | `/engineering/navigational-lighting` |
| 11 | Global Supply | `/engineering/global-supply` |

#### Column B — Connectivity & Managed Services

**Section hub:** `/managed-services`

| # | Service | Route |
|---|---|---|
| 1 | Industrial Network Design & Architecture Services | `/industrial-network-design-architecture-services` |
| 2 | OT Network Configuration & Installation Services | `/ot-network-configuration-installation-services` |
| 3 | OT Network Commissioning & Validation Services | `/ot-network-commissioning-validation-services` |
| 4 | Industrial Network Post-Project Support & Maintenance | `/industrial-network-post-project-support-maintenance` |
| 5 | Industrial Network Training & Certification | `/industrial-network-training-certification` |
| 6 | Fixed Wireless Site Surveys | `/fixed-wireless-site-surveys` |
| 7 | Fixed Wireless Installation & Startup | `/fixed-wireless-installation-and-startup` |
| 8 | Fleet Wireless Connectivity Assessment Services | `/fleet-wireless-connectivity-assessment-services` |
| 9 | Fleet Wireless Installation & Startup | `/fleet-wireless-installation-startup` |
| 10 | Provisioning & Kitting Services | `/provisioning-kitting-services` |
| 11 | Managed Services | `/managed-services` |
| 12 | Custom Managed Network Services | `/custom-managed-network-services` |
| 13 | Network Device Lifecycle Management Services | `/network-device-lifecycle-management-services` |

#### Column C — Markets We Serve

**Section hub:** `/industries`

| # | Market | Route |
|---|---|---|
| 1 | Upstream Oil & Gas | `/upstream-oil-gas` |
| 2 | Midstream Oil & Gas | `/midstream-oil-gas` |
| 3 | Refining & Petrochemical | `/refining-petrochemical` |
| 4 | Subsea | `/subsea` |
| 5 | Renewables | `/renewables` |
| 6 | Ports & Marine Operations | `/ports-marine-operations` |
| 7 | Power Generation | `/power-generation` |
| 8 | ITS & Transportation | `/its-transportation` |
| 9 | Industrial | `/industrial` |
| 10 | Healthcare | `/healthcare` |

---

### 2.3 Technologies

**Hub route:** `/technologies`

#### Column A — Industrial

**Section hub:** `/technologies/industrial`

| # | Technology | Route |
|---|---|---|
| 1 | Industrial Cybersecurity | `/technologies/industrial-cybersecurity` |
| 2 | Industrial IP Video | `/industrial-ip-video` |
| 3 | Data Integration and Visualization | `/data-integration-and-visualization` |
| 4 | Industrial Ethernet | `/industrial-ethernet` |
| 5 | Private Cellular Networks | `/technologies/private-cellular-networking` |
| 6 | IP Keyboard, Video and Monitor Extension | `/ip-keyboard-video-and-monitor-extension` |
| 7 | Cable, Connectivity and Hardware | `/cable-connectivity-and-hardware` |
| 8 | Public Cellular Networking | `/public-cellular-networking` |
| 9 | Wi-Fi Networking | `/wifi-networking` |
| 10 | Point-to-Point Networking | `/point-to-point-networking` |
| 11 | Edge Computing | `/edge-computing` |
| 12 | Satellite Broadband | `/satellite` |

#### Column B — Enterprise

**Section hub:** `/technologies/enterprise`

| # | Technology | Route |
|---|---|---|
| 1 | Digital Signage | `/digital-signage` |
| 2 | POTS Line Replacement | `/pots-line-replacement-services` |
| 3 | Pop-Up Networking | `/pop-up-networking` |
| 4 | Enterprise Public Cellular Networking | `/enterprise-public-cellular-networking` |
| 5 | Communication & Legacy Conversion Solutions | `/communication-legacy-conversion-solutions` |
| 6 | Wired Networking Technologies | `/wired-networking-technologies` |

---

### 2.4 Company

**Hub route:** `/about`  
From `Supercore - Categories.docx` → Company.

| # | Page | Route |
|---|---|---|
| 1 | About | `/about` |
| 2 | Our History | `/our-history` |
| 3 | Meet The Team | `/meet-the-team` |
| 4 | Manufacturing Partners | `/manufacturing-partners` |
| 5 | QHSE | `/qhse` |
| 6 | Our Core Values | `/our-core-values` |
| 7 | Success Stories | `/success-stories` |
| 8 | Net Zero | `/net-zero` |
| 9 | News | `/news` |
| 10 | Partners & Programs | `/partners-programs` |
| 11 | Careers | `/careers` |
| 12 | Case Studies | `/case-studies` |

---

### 2.5 Support

**Hub route:** `/support`

| # | Page | Route |
|---|---|---|
| 1 | Support (Help Desk CARE) | `/support` |
| 2 | Contact Us | `/contact-us` |
| 3 | Request Quote | `/get-a-quote` |
| 4 | Customer Service | `/support` |
| 5 | Tips & Tricks Blog | `/resources/tag/Blog` |

---

## 3. Homepage navigation & sections

**Route:** `/` (e.g. `/gb`)

### 3.1 Hero carousel (3 slides)

| Slide | Tag | Headline | Primary CTA | Route |
|---|---|---|---|---|
| 1 | Service Offerings | Real-World Industrial & Enterprise Services | Explore Services | `/offerings` |
| 2 | Connectivity Equipment | Critical Hardware for Every Network | Shop Products | `/all-products` |
| 3 | Contact Supercore | Your Partner for Seamless Connectivity | Work With Supercore | `/contact-us` |

Tab labels (bottom of hero): same three headlines; user can click to switch slides.

### 3.2 Quick links (icon row)

| # | Label | Route |
|---|---|---|
| 1 | Explore Catalog | `/store` |
| 2 | Contact Us | `/contact-us` |
| 3 | Markets We Serve | `/industries` |
| 4 | Request Quote | `/get-a-quote` |
| 5 | About Supercore | `/about` |
| 6 | Support | `/support` |

---

### 3.3 Our Services and Technologies

Section heading: **Our Services and Technologies**

Two sub-groups on the homepage (8 cards total):

#### Group A — Core Systems

Supercore-native product families; links to **Medusa catalog categories** (`/categories/{handle}`).

| # | Title | Description (summary) | CTA | Route | Medusa category handle |
|---|---|---|---|---|---|
| 1 | **CCTV & Video Systems** | Rugged cameras, analytics, recording for platforms, vessels, hazardous zones | Explore CCTV | `/categories/cctv-systems` | `cctv-systems` |
| 2 | **PAGA & Public Address** | Zone-based paging and alarm for industrial / marine environments | Explore PAGA | `/categories/paga-systems` | `paga-systems` |
| 3 | **Intercom & Access** | EX intercom, access control, edge comms for control rooms and field teams | Explore Intercom | `/categories/intercom-systems` | `intercom-systems` |
| 4 | **Hazardous Area Equipment** | Certified EX devices, cabling, enclosures for oil & gas, renewables, marine | Explore Hazardous Area | `/categories/hazardous-area` | `hazardous-area` |

#### Group B — Connectivity & Managed Services

Extended partner catalogue; links to **marketing / service pages**.

| # | Title | Description (summary) | CTA | Route |
|---|---|---|---|---|
| 5 | **Industrial Networking** | Wired and wireless networks for factories, plants, industrial sites | Explore Industrial Networking | `/industrial-network-design-architecture-services` |
| 6 | **Private Cellular** | Dedicated LTE/5G without public infrastructure | Learn About Private Cellular | `/technologies/private-cellular-networking` |
| 7 | **Public Cellular** | Enterprise LTE/5G WAN for branch, remote, mobile ops | Learn About Public Cellular | `/public-cellular-networking` |
| 8 | **Managed Services** | End-to-end support, monitoring, lifecycle management | See Managed Services | `/managed-services` |

---

### 3.4 Featured Categories (homepage tiles)

Partner catalogue highlights (marketing routes under `/all-products/`).

| # | Title | Route |
|---|---|---|
| 1 | Ethernet Switches | `/all-products/ethernet-switches` |
| 2 | Cellular Gateways | `/all-products/cellular-routers-gateways` |
| 3 | Security Appliances | `/all-products/network-security-routers` |
| 4 | Cabling & Connectivity | `/all-products/cabling` |

Footer link: **Explore Full Product Catalog** → `/all-products`

---

### 3.5 Proven Results + Real-World Impact (insights)

| # | Tag | Title | Route |
|---|---|---|---|
| 1 | Insight | Designing CCTV for Hazardous and Offshore Environments | `/resources/tag/Blog` |
| 2 | Insight | Private 5G vs Wi-Fi: Which Technology Is Right for Your Site? | `/resources/tag/Blog` |
| 3 | Insight | The Most Overlooked Part of Site Comms Is the Cable Plant | `/resources/tag/Blog` |

---

### 3.6 About Supercore (homepage block)

- Copy: Supercore Industrial Systems Ltd overview
- CTA: **Get to Know Supercore** → `/about`

---

### 3.7 Bottom CTA

- Heading: **Not sure where to start?**
- CTA: **Connect With Us** → `/contact-us`

---

### 3.8 Featured products (dynamic)

- Source: Medusa **Collections** assigned in Admin
- Rendered when collections exist; each rail links to `/collections/{handle}`
- Product cards link to `/products/{handle}`

---

## 4. Medusa catalog — Categories (live ecommerce)

Seeded in `supercore-category-tree.ts` (applied by `initial-data-seed.ts`). Full tree: `docs/master/SUPERCORE-CATEGORIES.md`.

### 4.1 Root categories (13)

| # | Name | Handle | Homepage Core Systems link |
|---|---|---|---|
| 1 | CCTV Systems | `cctv-systems` | Yes — CCTV & Video Systems |
| 2 | PAGA Systems | `paga-systems` | Yes — PAGA & Public Address |
| 3 | Intercom Systems | `intercom-systems` | Yes — Intercom & Access |
| 4 | Public Address Systems | `public-address-systems` | — |
| 5 | Solution Platforms | `solution-platforms` | — |
| 6 | Explosion-Protected Devices | `explosion-protected-devices` | — |
| 7 | Network Audio | `network-audio` | — |
| 8 | Access Control | `access-control` | — |
| 9 | Radar | `radar` | — |
| 10 | Video analytics | `video-analytics` | — |
| 11 | Hazardous Area | `hazardous-area` | Yes — Hazardous Area Equipment |
| 12 | Safe Area | `safe-area` | — |
| 13 | Cables | `cables` | — |

**CCTV child highlight:** `cctv-systems` → `cctv-explosion-protected` (leaf; see `SUPERCORE-CATEGORIES.md` v1.6).

### 4.2 Child categories

Full child and grandchild taxonomy (**88 handles**) is documented in **`docs/master/SUPERCORE-CATEGORIES.md` v1.6** and defined in `apps/backend/src/lib/seed/supercore-category-tree.ts`.

#### Sample — CCTV Systems (`cctv-systems`)

| Name | Handle |
|---|---|
| Box Cameras | `cctv-box` |
| Bullet Cameras | `cctv-bullet` |
| Dome Cameras | `cctv-dome` |
| PTZ Cameras | `cctv-ptz` |
| Thermal Imaging | `cctv-thermal` |
| Storage and Recorders | `cctv-storage` |

#### Under PAGA Systems (`paga-systems`)

| Name | Handle |
|---|---|
| EXIGO Networked IP PA/GA | `paga-exigo` |
| SPA-V2 PA/GA | `paga-spa-v2` |

#### Under Intercom Systems (`intercom-systems`)

| Name | Handle |
|---|---|
| IC-EDGE System | `intercom-ic-edge` |
| ICX-AlphaCom Platform | `intercom-icx-alphacom` |
| IP and SIP Intercom | `intercom-ip-sip` |

#### Under Cables (`cables`)

| Name | Handle |
|---|---|
| NEK Sealine Marine Cables | `cables-nek-sealine` |
| Fibre Optic Cables | `cables-fibre` |
| Pre-Term Fibre Optic Assemblies | `cables-preterm-fibre` |

#### Under Explosion-Protected Devices (`explosion-protected-devices`)

| Name | Handle |
|---|---|
| Zone 1 / Division 1 Cameras | `ex-zone1-cameras` |
| Accessories for Hazardous Areas | `ex-accessories` |

#### Under Hazardous Area (`hazardous-area`)

| Name | Handle |
|---|---|
| Hazardous Area PTZ Camera Stations | `haz-ptz-stations` |

#### Under Safe Area (`safe-area`)

| Name | Handle |
|---|---|
| Safe Area PTZ Camera Stations | `safe-ptz-stations` |

### 4.3 Sample products (seed)

| Product | Handle | Primary category | Notes |
|---|---|---|---|
| Industrial Dome Camera | `industrial-dome-camera` | CCTV Systems | Variants: Safe Area, Zone 2 |
| EXIGO Network Amplifier Module | `exigo-network-amplifier` | PAGA Systems | MPN metadata on variants |
| NEK 606 Marine Instrumentation Cable | `nek-606-marine-cable` | Cables | Per-metre pricing |
| Zone 1 PTZ Camera Station | `zone-1-ptz-camera-station` | Explosion-Protected Devices | Quote-gated (Trade Account price list) |

**Catalog browse:** `/store`  
**Product detail:** `/products/{handle}`

---

## 5. Medusa catalog — Collections

Collections are **managed in Medusa Admin** (not hard-coded in navigation). They power:

- Homepage **Featured products** rails
- Routes: `/collections/{handle}`

| Usage | Route pattern | How to configure |
|---|---|---|
| Featured collection rail | `/collections/{handle}` | Admin → Products → Collections |
| All products (unfiltered) | `/store` | Default catalog view |
| Search results | `/search?q=…` | Typesense + Medusa fallback |

**Recommended collections to create in Admin** (suggested naming — not yet seeded):

| Suggested collection title | Suggested handle | Purpose |
|---|---|---|
| Featured Products | `featured` | Homepage product rail |
| Hazardous Area Cameras | `hazardous-area-cameras` | EX / ATEX product spotlight |
| Industrial Networking | `industrial-networking` | Switches, gateways, routers |
| New Arrivals | `new-arrivals` | Merchandising |
| Request Quote Items | `quote-only` | Quote-gated SKUs |

---

## 6. Footer navigation

Dark footer with logo, tagline, phone, three link columns, legal row.

### Column — Company

Same as §2.4 Company menu.

### Column — Quick Links

| Label | Route |
|---|---|
| Contact | `/contact-us` |
| Explore Catalog | `/store` |
| Account | `/account` |
| Tips & Tricks Blog | `/resources/tag/Blog` |
| Customer Service | `/support` |

### Column — Top Categories (Supercore Products)

| Label | Route |
|---|---|
| CCTV Systems | `/categories/cctv-systems` |
| PAGA Systems | `/categories/paga-systems` |
| Intercom Systems | `/categories/intercom-systems` |
| Public Address Systems | `/categories/public-address-systems` |
| Explosion-Protected Devices | `/categories/explosion-protected-devices` |
| Hazardous Area | `/categories/hazardous-area` |
| Cables | `/categories/cables` |

### Legal row

| Item | Route / link |
|---|---|
| Copyright | © {year} Supercore Industrial Systems Ltd |
| Sitemap | `/sitemap` |
| Privacy Policy | `/privacy-policy` |
| LinkedIn | External |
| YouTube | External |

---

## 7. Mobile navigation

Hamburger **Menu** exposes:

1. **Top-level hubs:** Products, Services, Technologies, Company, Support (each links to hub route)
2. **Expanded sections** (full link lists):
   - Products — first 8 Supercore categories + 6 brands
   - Engineering — all engineering services
   - Services — connectivity & managed services
   - Markets We Serve — all market links
   - Technologies — industrial + enterprise lists
   - Company — company links
   - Support — support links
   - Contact — contact dropdown items
3. **Utility:** Cart, Account
4. **Locale / region** selectors — region lists countries with currency label (GBP, EUR, USD); cart and quote `region_id` update on switch

---

## 8. Commerce & account routes (not in mega menu)

| Route | Purpose |
|---|---|
| `/store` | Full product catalog |
| `/search` | Search results |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/account` | Login |
| `/account/profile` | Profile |
| `/account/orders` | Order history |
| `/account/addresses` | Addresses |
| `/get-a-quote` | Quote request form |
| `/quote` | Quote cart (add/remove lines, submit) |
| `/contact-us` | Contact form + offices |

### 8.1 Medusa Admin — B2B quote requests

Not part of the storefront; managed in **Medusa Admin** at http://localhost:9000/app.

| Admin route | Purpose |
|---|---|
| **Orders → Quote requests** | List submitted/draft quote carts from storefront |
| `/orders/quote-requests/:id` | Detail: customer, line items, workflow status, Zoho ERP IDs |
| Order detail widget | Shows linked quote when `metadata.order_id` matches order |

Full API and metadata schema: `docs/master/B2B-QUOTE-ADMIN.md`.

---

## 9. Cross-reference map

How homepage **Core Systems** cards map to catalog vs marketing:

```
Homepage Card              → Primary destination        → Backend type
─────────────────────────────────────────────────────────────────────────
CCTV & Video Systems       → /categories/cctv-systems   → Medusa category
PAGA & Public Address      → /categories/paga-systems   → Medusa category
Intercom & Access          → /categories/intercom-systems → Medusa category
Hazardous Area Equipment   → /categories/hazardous-area → Medusa category
Industrial Networking      → /industrial-network-…      → Marketing page
Private Cellular           → /technologies/private-…      → Marketing page
Public Cellular            → /public-cellular-networking → Marketing page
Managed Services           → /managed-services          → Marketing page
```

How **Products mega menu** relates to catalog:

```
Marketing category (/all-products/*)  →  Future Medusa mapping
Brand page (/brands/*)                →  Product filter by manufacturer metadata
Medusa category (/categories/*)       →  Live SKUs from seed + Admin
Collection (/collections/*)           →  Curated groups from Admin
```

---

## 10. Maintenance

| Change | Edit file |
|---|---|
| Mega menu links (marketing) | `apps/storefront/src/lib/site-navigation.ts` |
| Products mega menu (Medusa tree) | `apps/storefront/src/lib/mega-menu/catalog-nav.ts` |
| Mega menu UX / animation | `apps/storefront/src/modules/layout/components/mega-menu/` |
| Expandable search header | `apps/storefront/src/modules/layout/components/nav-bar-client/` |
| Region / currency selector | `apps/storefront/src/modules/layout/components/country-select/` |
| Homepage services cards | `apps/storefront/src/lib/home-content.ts` |
| Medusa category tree | `apps/backend/src/migration-scripts/supercore-category-tree.ts` |
| Medusa seed / products | `apps/backend/src/migration-scripts/initial-data-seed.ts` + Admin |
| Collections | Medusa Admin → Collections |
| B2B quote admin | `apps/backend/src/admin/routes/orders/quote-requests/` |
| Brand / legal name | `apps/storefront/src/lib/brand.ts` |
| Master docs | `docs/master/*.md` |

---

*Supercore Industrial Systems Ltd — Navigation Menu Document v1.7*
