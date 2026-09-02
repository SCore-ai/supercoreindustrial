import type { ResolvedOnlineStoreSettings } from "./types"

export type StorefrontOnlineStorePayload = {
  theme: {
    name: string
    version: string
    storefront_url: string | null
    colors: ResolvedOnlineStoreSettings["colors"]
    typography: ResolvedOnlineStoreSettings["typography"]
    layout: ResolvedOnlineStoreSettings["layout"]
    mega_menu_layout: ResolvedOnlineStoreSettings["mega_menu_layout"]
    announcement: ResolvedOnlineStoreSettings["announcement"]
    custom_css: string | null
    updated_at?: string
  }
  navigation: {
    main_navigation: ResolvedOnlineStoreSettings["main_navigation"]
    contact_menu: ResolvedOnlineStoreSettings["contact_menu"]
    partner_catalog: ResolvedOnlineStoreSettings["partner_catalog"]
    footer: ResolvedOnlineStoreSettings["footer"]
  }
  homepage: ResolvedOnlineStoreSettings["homepage"]
}

export function toStorefrontPayload(
  settings: ResolvedOnlineStoreSettings
): StorefrontOnlineStorePayload {
  return {
    theme: {
      name: settings.theme_name,
      version: settings.theme_version,
      storefront_url: settings.storefront_url,
      colors: settings.colors,
      typography: settings.typography,
      layout: settings.layout,
      mega_menu_layout: settings.mega_menu_layout,
      announcement: settings.announcement,
      custom_css: settings.custom_css,
      updated_at: settings.updated_at,
    },
    navigation: {
      main_navigation: settings.main_navigation,
      contact_menu: settings.contact_menu,
      partner_catalog: settings.partner_catalog,
      footer: settings.footer,
    },
    homepage: settings.homepage,
  }
}
