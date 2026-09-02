import type {
  OnlineStoreAnnouncement,
  OnlineStoreFooter,
  OnlineStoreHomepage,
  OnlineStoreMegaMenuLayout,
  OnlineStoreNavLink,
  OnlineStoreNavMenu,
  OnlineStoreSettingsRecord,
  OnlineStoreThemeColors,
  OnlineStoreThemeLayout,
  OnlineStoreThemeTypography,
  ResolvedOnlineStoreSettings,
  UpdateOnlineStoreHomepagePayload,
  UpdateOnlineStoreNavigationPayload,
  UpdateOnlineStoreThemePayload,
} from "./types"

export const DEFAULT_COLORS: OnlineStoreThemeColors = {
  cta: "#FFB700",
  ctaHover: "#E6A500",
  ink: "#0A1628",
  body: "#0A0A0A",
  steel: "#1A2F45",
  line: "#D5DEE6",
  paper: "#F5F7F9",
  footer: "#0C141D",
  search: "#EFF5FB",
  accent: "#FFB700",
}

export const DEFAULT_TYPOGRAPHY: OnlineStoreThemeTypography = {
  baseFontSize: "16px",
  headingSize: "36px",
  megaMenuTitleSize: "28px",
  navLinkHeight: "65px",
}

export const DEFAULT_LAYOUT: OnlineStoreThemeLayout = {
  headerHeight: "96px",
  megaMenuPanelMinHeight: 440,
  megaMenuPanelMaxHeight: 520,
  contentMaxWidth: "1440px",
}

export const DEFAULT_MEGA_MENU_LAYOUT: OnlineStoreMegaMenuLayout = {
  openDelayMs: 80,
  closeDelayMs: 250,
  panelTransitionMs: 300,
  flatColumns: 3,
}

export const DEFAULT_ANNOUNCEMENT: OnlineStoreAnnouncement = {
  enabled: true,
  message:
    "We launched the new Supercore Industrial Systems Ltd storefront. Returning customers can set a new password.",
  linkLabel: "set a new password",
  linkHref: "/account",
  dismissible: true,
}

export const DEFAULT_HOMEPAGE: OnlineStoreHomepage = {
  heroSlides: [
    {
      id: "services",
      tag: "Service Offerings",
      title: "Real-World Industrial & Enterprise Services",
      description:
        "From system design and integration to ongoing support, Supercore delivers end-to-end services that simplify complex sites.",
      ctaLabel: "Explore Services",
      ctaHref: "/offerings",
      image:
        "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/ins-homepage-header01.jpg?t=1770319796",
      imageAlt: "Engineers reviewing industrial systems plans",
      tabLabel: "Real-World Industrial & Enterprise Services",
    },
    {
      id: "equipment",
      tag: "Connectivity Equipment",
      title: "Critical Hardware for Every Network",
      description:
        "Explore CCTV, PAGA, intercom, explosion-protected devices, and industrial networking hardware.",
      ctaLabel: "Shop Products",
      ctaHref: "/all-products",
      image:
        "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/02-istock-1450443859-3.jpg?t=1759161556",
      imageAlt: "Industrial facility with connectivity hardware",
      tabLabel: "Critical Hardware for Every Network",
    },
  ],
  featuredCategories: [
    {
      handle: "ethernet-switches",
      title: "Ethernet Switches",
      href: "/all-products/ethernet-switches",
      image:
        "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-industrial-switches.png?t=1743435056",
      imageAlt: "Industrial Ethernet switches",
    },
    {
      handle: "cellular-routers-gateways",
      title: "Cellular Gateways",
      href: "/all-products/cellular-routers-gateways",
      image:
        "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-cellular-router.png?t=1743435822",
      imageAlt: "Cellular IoT routers and gateways",
    },
    {
      handle: "network-security-routers",
      title: "Security Appliances",
      href: "/all-products/network-security-routers",
      image:
        "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-industrial-security-appliance.png?t=1743436021",
      imageAlt: "Industrial security appliances",
    },
    {
      handle: "cabling",
      title: "Cabling & Connectivity",
      href: "/all-products/cabling",
      image:
        "https://cdn11.bigcommerce.com/s-hltjsp5jm3/images/stencil/original/image-manager/hp-industrial-cabling.png?t=1743436463",
      imageAlt: "Industrial cables and connectivity",
    },
  ],
}

/** Mirrors apps/storefront/src/lib/site-navigation.ts MAIN_NAV at install time */
export const DEFAULT_MAIN_NAVIGATION: OnlineStoreNavMenu[] = [
  {
    label: "Services",
    href: "/services",
    columns: [
      {
        title: "Engineering Services",
        href: "/offerings",
        items: [
          { label: "Industrial Communication", href: "/engineering/industrial-communication" },
          { label: "Fire & Gas", href: "/engineering/fire-gas" },
          { label: "System Integration", href: "/engineering/system-integration" },
        ],
      },
      {
        title: "Connectivity & Managed Services",
        href: "/managed-services",
        items: [
          { label: "Managed Services", href: "/managed-services" },
          { label: "Custom Managed Network Services", href: "/custom-managed-network-services" },
        ],
      },
      {
        title: "Markets We Serve",
        href: "/industries",
        items: [
          { label: "Upstream Oil & Gas", href: "/upstream-oil-gas" },
          { label: "Renewables", href: "/renewables" },
        ],
      },
    ],
  },
  {
    label: "Technologies",
    href: "/technologies",
    columns: [
      {
        title: "Industrial",
        href: "/technologies/industrial",
        items: [
          { label: "Industrial Cybersecurity", href: "/technologies/industrial-cybersecurity" },
          { label: "Industrial Ethernet", href: "/industrial-ethernet" },
        ],
      },
      {
        title: "Enterprise",
        href: "/technologies/enterprise",
        items: [
          { label: "Digital Signage", href: "/digital-signage" },
          { label: "Pop-Up Networking", href: "/pop-up-networking" },
        ],
      },
    ],
  },
  {
    label: "Company",
    href: "/about",
    columns: [
      {
        title: "About Us",
        href: "/about",
        items: [
          { label: "About", href: "/about" },
          { label: "Our History", href: "/our-history" },
          { label: "Careers", href: "/careers" },
        ],
      },
    ],
  },
  {
    label: "Support",
    href: "/support",
    columns: [
      {
        title: "Support",
        items: [
          { label: "Support", href: "/support" },
          { label: "Contact Us", href: "/contact-us" },
          { label: "Request Quote", href: "/get-a-quote" },
        ],
      },
    ],
  },
]

export const DEFAULT_CONTACT_MENU: OnlineStoreNavLink[] = [
  { label: "Contact Us", href: "/contact-us" },
  { label: "Request Quote", href: "/get-a-quote" },
  { label: "Quote cart", href: "/quote" },
  { label: "Support", href: "/support" },
  { label: "Email Sales", href: "mailto:sales@supercore.local" },
]

/** Partner / extended connectivity catalogue — mirrors storefront site-navigation.ts */
export const DEFAULT_PARTNER_CATALOG: OnlineStoreNavLink[] = [
  { label: "All Partner Products", href: "/all-products" },
  { label: "Antennas", href: "/all-products/antennas" },
  { label: "Cabinetry & Enclosures", href: "/all-products/cabinetry-enclosures" },
  { label: "Cable Entry Seals", href: "/all-products/cable-entry-seals" },
  { label: "Cabling", href: "/all-products/cabling" },
  { label: "Cabling Tools & Testers", href: "/all-products/cabling-tools-testers" },
  { label: "Cameras & Video", href: "/all-products/cameras-video" },
  { label: "Cellular Routers & Gateways", href: "/all-products/cellular-routers-gateways" },
  { label: "Connectors", href: "/all-products/connectors" },
  { label: "Ethernet Extenders", href: "/all-products/ethernet-extenders" },
  { label: "Ethernet Switches", href: "/all-products/ethernet-switches" },
  { label: "Fieldbus Cards & Modules", href: "/all-products/fieldbus-cards-modules" },
  {
    label: "IoT Gateways, Computers & Monitors",
    href: "/all-products/iot-gateways-computers-monitors",
  },
  { label: "Industrial I/O", href: "/all-products/industrial-i-o" },
  { label: "KVM Switches & Extenders", href: "/all-products/kvm-switches-extenders" },
  { label: "Media Converters", href: "/all-products/media-converters" },
  { label: "Mounting Hardware", href: "/mounting-hardware" },
  {
    label: "Network Management",
    href: "/all-products/network-management-software-appliances",
  },
  { label: "Network Security & Routers", href: "/all-products/network-security-routers" },
  { label: "Patch Panels", href: "/all-products/patch-panels" },
  { label: "Power Solutions", href: "/all-products/power-solutions" },
  { label: "Remote Access", href: "/all-products/remote-access" },
  { label: "Serial & USB Connectivity", href: "/all-products/serial-usb-connectivity" },
  {
    label: "Serial Device Servers & Protocol Converters",
    href: "/all-products/serial-device-servers-protocol-converters",
  },
  { label: "Surge & Lightning Protection", href: "/all-products/surge-lightning-protection" },
  { label: "Wireless Radios", href: "/all-products/wireless-radios" },
]

export const DEFAULT_FOOTER: OnlineStoreFooter = {
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "News", href: "/news" },
  ],
  quickLinks: [
    { label: "Contact", href: "/contact-us" },
    { label: "Spectrum Camera", href: "/brands/spectrum" },
    { label: "Explore Catalog", href: "/store" },
    { label: "Account", href: "/account" },
  ],
}

function mergePartial<T extends object>(defaults: T, override: Partial<T> | null | undefined): T {
  if (!override) return defaults
  return { ...defaults, ...override }
}

export function resolveOnlineStoreSettings(
  record: OnlineStoreSettingsRecord
): ResolvedOnlineStoreSettings {
  return {
    id: record.id,
    theme_name: record.theme_name || "Supercore Industrial",
    theme_version: record.theme_version || "1.0.0",
    storefront_url: record.storefront_url ?? null,
    colors: mergePartial(DEFAULT_COLORS, record.colors ?? undefined),
    typography: mergePartial(DEFAULT_TYPOGRAPHY, record.typography ?? undefined),
    layout: mergePartial(DEFAULT_LAYOUT, record.layout ?? undefined),
    mega_menu_layout: mergePartial(
      DEFAULT_MEGA_MENU_LAYOUT,
      record.mega_menu_layout ?? undefined
    ),
    announcement: mergePartial(
      DEFAULT_ANNOUNCEMENT,
      record.announcement ?? undefined
    ),
    main_navigation: record.main_navigation?.length
      ? record.main_navigation
      : DEFAULT_MAIN_NAVIGATION,
    contact_menu: record.contact_menu?.length
      ? record.contact_menu
      : DEFAULT_CONTACT_MENU,
    partner_catalog: record.partner_catalog?.length
      ? record.partner_catalog
      : DEFAULT_PARTNER_CATALOG,
    footer: record.footer
      ? {
          company: record.footer.company?.length
            ? record.footer.company
            : DEFAULT_FOOTER.company,
          quickLinks: record.footer.quickLinks?.length
            ? record.footer.quickLinks
            : DEFAULT_FOOTER.quickLinks,
        }
      : DEFAULT_FOOTER,
    homepage: record.homepage ?? DEFAULT_HOMEPAGE,
    custom_css: record.custom_css ?? null,
    has_unpublished_changes: record.has_unpublished_changes ?? false,
    published_at:
      typeof record.published_at === "string"
        ? record.published_at
        : record.published_at?.toISOString?.(),
    updated_at:
      typeof record.updated_at === "string"
        ? record.updated_at
        : record.updated_at?.toISOString?.(),
  }
}

export function applyDraftOverlay(
  published: ResolvedOnlineStoreSettings,
  draft: OnlineStoreSettingsRecord["draft_payload"]
): ResolvedOnlineStoreSettings {
  if (!draft) return published

  return {
    ...published,
    theme_name: draft.theme_name ?? published.theme_name,
    theme_version: draft.theme_version ?? published.theme_version,
    storefront_url:
      draft.storefront_url !== undefined
        ? draft.storefront_url
        : published.storefront_url,
    colors: draft.colors ? { ...published.colors, ...draft.colors } : published.colors,
    typography: draft.typography
      ? { ...published.typography, ...draft.typography }
      : published.typography,
    layout: draft.layout ? { ...published.layout, ...draft.layout } : published.layout,
    mega_menu_layout: draft.mega_menu_layout
      ? { ...published.mega_menu_layout, ...draft.mega_menu_layout }
      : published.mega_menu_layout,
    announcement: draft.announcement
      ? { ...published.announcement, ...draft.announcement }
      : published.announcement,
    main_navigation: draft.main_navigation ?? published.main_navigation,
    contact_menu: draft.contact_menu ?? published.contact_menu,
    partner_catalog: draft.partner_catalog ?? published.partner_catalog,
    footer: draft.footer
      ? {
          company: draft.footer.company ?? published.footer.company,
          quickLinks: draft.footer.quickLinks ?? published.footer.quickLinks,
        }
      : published.footer,
    homepage: draft.homepage ?? published.homepage,
    custom_css: draft.custom_css !== undefined ? draft.custom_css : published.custom_css,
  }
}

export function buildDraftPatch(
  currentDraft: OnlineStoreSettingsRecord["draft_payload"],
  patch: Record<string, unknown>
): OnlineStoreSettingsRecord["draft_payload"] {
  return {
    ...(currentDraft ?? {}),
    ...patch,
  }
}

export function applyThemeUpdate(
  current: ResolvedOnlineStoreSettings,
  payload: UpdateOnlineStoreThemePayload
) {
  return {
    theme_name: payload.theme_name ?? current.theme_name,
    theme_version: payload.theme_version ?? current.theme_version,
    storefront_url:
      payload.storefront_url !== undefined
        ? payload.storefront_url
        : current.storefront_url,
    colors: payload.colors ? { ...current.colors, ...payload.colors } : current.colors,
    typography: payload.typography
      ? { ...current.typography, ...payload.typography }
      : current.typography,
    layout: payload.layout ? { ...current.layout, ...payload.layout } : current.layout,
    mega_menu_layout: payload.mega_menu_layout
      ? { ...current.mega_menu_layout, ...payload.mega_menu_layout }
      : current.mega_menu_layout,
    announcement: payload.announcement
      ? { ...current.announcement, ...payload.announcement }
      : current.announcement,
    custom_css:
      payload.custom_css !== undefined ? payload.custom_css : current.custom_css,
  }
}

export function applyNavigationUpdate(
  current: ResolvedOnlineStoreSettings,
  payload: UpdateOnlineStoreNavigationPayload
) {
  return {
    main_navigation: payload.main_navigation ?? current.main_navigation,
    contact_menu: payload.contact_menu ?? current.contact_menu,
    partner_catalog: payload.partner_catalog ?? current.partner_catalog,
    footer: payload.footer
      ? {
          company: payload.footer.company ?? current.footer.company,
          quickLinks: payload.footer.quickLinks ?? current.footer.quickLinks,
        }
      : current.footer,
  }
}

export function applyHomepageUpdate(
  current: ResolvedOnlineStoreSettings,
  payload: UpdateOnlineStoreHomepagePayload
) {
  return {
    homepage: payload.homepage ?? current.homepage,
  }
}

export function draftToPublishedColumns(
  published: ResolvedOnlineStoreSettings
): Partial<OnlineStoreSettingsRecord> {
  return {
    theme_name: published.theme_name,
    theme_version: published.theme_version,
    storefront_url: published.storefront_url,
    colors: published.colors,
    typography: published.typography,
    layout: published.layout,
    mega_menu_layout: published.mega_menu_layout,
    announcement: published.announcement,
    main_navigation: published.main_navigation,
    contact_menu: published.contact_menu,
    partner_catalog: published.partner_catalog,
    footer: published.footer,
    homepage: published.homepage,
    custom_css: published.custom_css,
  }
}

export function getPreviewSecret() {
  return process.env.ONLINE_STORE_PREVIEW_SECRET ?? "supercore-preview-dev"
}

export function isValidPreviewToken(token?: string | null) {
  return !!token && token === getPreviewSecret()
}
