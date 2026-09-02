export type OnlineStoreNavLink = {
  label: string
  href: string
  description?: string
}

export type OnlineStoreNavColumn = {
  title: string
  href?: string
  items: OnlineStoreNavLink[]
}

export type OnlineStoreNavMenu = {
  label: string
  href?: string
  columns?: OnlineStoreNavColumn[]
}

export type OnlineStoreThemeColors = {
  cta: string
  ctaHover: string
  ink: string
  body: string
  steel: string
  line: string
  paper: string
  footer: string
  search: string
  accent: string
}

export type OnlineStoreThemeTypography = {
  baseFontSize: string
  headingSize: string
  megaMenuTitleSize: string
  navLinkHeight: string
}

export type OnlineStoreThemeLayout = {
  headerHeight: string
  megaMenuPanelMinHeight: number
  megaMenuPanelMaxHeight: number
  contentMaxWidth: string
}

export type OnlineStoreMegaMenuLayout = {
  openDelayMs: number
  closeDelayMs: number
  panelTransitionMs: number
  flatColumns: number
}

export type OnlineStoreAnnouncement = {
  enabled: boolean
  message: string
  linkLabel?: string
  linkHref?: string
  dismissible: boolean
}

export type OnlineStoreFooter = {
  company: OnlineStoreNavLink[]
  quickLinks: OnlineStoreNavLink[]
}

export type HomepageHeroSlide = {
  id: string
  tag: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  image: string
  imageAlt: string
  tabLabel: string
}

export type HomepageFeaturedCategory = {
  handle: string
  title: string
  href?: string
  image: string
  imageAlt: string
}

export type OnlineStoreHomepage = {
  heroSlides: HomepageHeroSlide[]
  featuredCategories: HomepageFeaturedCategory[]
}

export type OnlineStoreDraftPayload = {
  theme_name?: string
  theme_version?: string
  storefront_url?: string | null
  colors?: Partial<OnlineStoreThemeColors>
  typography?: Partial<OnlineStoreThemeTypography>
  layout?: Partial<OnlineStoreThemeLayout>
  mega_menu_layout?: Partial<OnlineStoreMegaMenuLayout>
  announcement?: Partial<OnlineStoreAnnouncement>
  main_navigation?: OnlineStoreNavMenu[]
  contact_menu?: OnlineStoreNavLink[]
  footer?: Partial<OnlineStoreFooter>
  partner_catalog?: OnlineStoreNavLink[]
  homepage?: OnlineStoreHomepage
  custom_css?: string | null
}

export type OnlineStoreSettingsRecord = {
  id: string
  theme_name: string
  theme_version: string
  storefront_url: string | null
  colors: OnlineStoreThemeColors | null
  typography: OnlineStoreThemeTypography | null
  layout: OnlineStoreThemeLayout | null
  mega_menu_layout: OnlineStoreMegaMenuLayout | null
  announcement: OnlineStoreAnnouncement | null
  main_navigation: OnlineStoreNavMenu[] | null
  contact_menu: OnlineStoreNavLink[] | null
  footer: OnlineStoreFooter | null
  partner_catalog: OnlineStoreNavLink[] | null
  homepage: OnlineStoreHomepage | null
  custom_css: string | null
  draft_payload: OnlineStoreDraftPayload | null
  has_unpublished_changes: boolean
  published_at: Date | string | null
  metadata: Record<string, unknown> | null
  created_at?: Date | string
  updated_at?: Date | string
}

export type ResolvedOnlineStoreSettings = {
  id: string
  theme_name: string
  theme_version: string
  storefront_url: string | null
  colors: OnlineStoreThemeColors
  typography: OnlineStoreThemeTypography
  layout: OnlineStoreThemeLayout
  mega_menu_layout: OnlineStoreMegaMenuLayout
  announcement: OnlineStoreAnnouncement
  main_navigation: OnlineStoreNavMenu[]
  contact_menu: OnlineStoreNavLink[]
  footer: OnlineStoreFooter
  partner_catalog: OnlineStoreNavLink[]
  homepage: OnlineStoreHomepage
  custom_css: string | null
  has_unpublished_changes: boolean
  published_at?: string
  updated_at?: string
}

export type UpdateOnlineStoreThemePayload = {
  theme_name?: string
  theme_version?: string
  storefront_url?: string | null
  colors?: Partial<OnlineStoreThemeColors>
  typography?: Partial<OnlineStoreThemeTypography>
  layout?: Partial<OnlineStoreThemeLayout>
  mega_menu_layout?: Partial<OnlineStoreMegaMenuLayout>
  announcement?: Partial<OnlineStoreAnnouncement>
  custom_css?: string | null
}

export type UpdateOnlineStoreNavigationPayload = {
  main_navigation?: OnlineStoreNavMenu[]
  contact_menu?: OnlineStoreNavLink[]
  partner_catalog?: OnlineStoreNavLink[]
  footer?: Partial<OnlineStoreFooter>
}

export type UpdateOnlineStoreHomepagePayload = {
  homepage?: OnlineStoreHomepage
}

export const ONLINE_STORE_SETTINGS_ID = "online_store_settings"
