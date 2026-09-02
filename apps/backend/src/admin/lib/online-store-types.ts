export type {
  HomepageFeaturedCategory,
  HomepageHeroSlide,
  OnlineStoreAnnouncement,
  OnlineStoreFooter,
  OnlineStoreHomepage,
  OnlineStoreMegaMenuLayout,
  OnlineStoreNavColumn,
  OnlineStoreNavLink,
  OnlineStoreNavMenu,
  OnlineStoreThemeColors,
  OnlineStoreThemeLayout,
  OnlineStoreThemeTypography,
  ResolvedOnlineStoreSettings,
  UpdateOnlineStoreHomepagePayload,
  UpdateOnlineStoreNavigationPayload,
  UpdateOnlineStoreThemePayload,
} from "../../lib/online-store/types"

export type OnlineStoreOverviewResponse = {
  theme: {
    name: string
    version: string
    storefront_url: string | null
    colors: import("../../lib/online-store/types").OnlineStoreThemeColors
    typography: import("../../lib/online-store/types").OnlineStoreThemeTypography
    layout: import("../../lib/online-store/types").OnlineStoreThemeLayout
    mega_menu_layout: import("../../lib/online-store/types").OnlineStoreMegaMenuLayout
    announcement: import("../../lib/online-store/types").OnlineStoreAnnouncement
    custom_css: string | null
    updated_at?: string
  }
  navigation: {
    main_navigation: import("../../lib/online-store/types").OnlineStoreNavMenu[]
    contact_menu: import("../../lib/online-store/types").OnlineStoreNavLink[]
    footer: import("../../lib/online-store/types").OnlineStoreFooter
  }
  homepage: import("../../lib/online-store/types").OnlineStoreHomepage
  has_unpublished_changes: boolean
  published_at?: string
}

export type OnlineStoreThemeResponse = {
  settings: import("../../lib/online-store/types").ResolvedOnlineStoreSettings
}

export type OnlineStoreNavigationResponse = {
  main_navigation: import("../../lib/online-store/types").OnlineStoreNavMenu[]
  contact_menu: import("../../lib/online-store/types").OnlineStoreNavLink[]
  partner_catalog: import("../../lib/online-store/types").OnlineStoreNavLink[]
  footer: import("../../lib/online-store/types").OnlineStoreFooter
  mega_menu_layout: import("../../lib/online-store/types").OnlineStoreMegaMenuLayout
  products_menu: import("../../lib/online-store/catalog-navigation").ProductsMenuPreview
  updated_at?: string
}

export type OnlineStoreHomepageResponse = {
  homepage: import("../../lib/online-store/types").OnlineStoreHomepage
  has_unpublished_changes: boolean
  published_at?: string
  updated_at?: string
}

export type OnlineStorePreviewResponse = {
  token: string
  preview_url: string
  storefront_url: string
}
