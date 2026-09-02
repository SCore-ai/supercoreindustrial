"use server"

import { sdk } from "@lib/config"
import { getCacheOptions } from "./cookies"
import { headers } from "next/headers"

export type StoreOnlineStoreNavLink = {
  label: string
  href: string
  description?: string
}

export type StoreOnlineStoreNavColumn = {
  title: string
  href?: string
  items: StoreOnlineStoreNavLink[]
}

export type StoreOnlineStoreNavMenu = {
  label: string
  href?: string
  columns?: StoreOnlineStoreNavColumn[]
}

export type StoreHomepageHeroSlide = {
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

export type StoreHomepageFeaturedCategory = {
  handle: string
  title: string
  href?: string
  image: string
  imageAlt: string
}

export type StoreOnlineStoreSettings = {
  theme: {
    name: string
    version: string
    storefront_url: string | null
    colors: Record<string, string>
    typography: Record<string, string>
    layout: Record<string, string | number>
    mega_menu_layout: Record<string, number>
    announcement: {
      enabled: boolean
      message: string
      linkLabel?: string
      linkHref?: string
      dismissible: boolean
    }
    custom_css: string | null
    updated_at?: string
  }
  navigation: {
    main_navigation: StoreOnlineStoreNavMenu[]
    contact_menu: StoreOnlineStoreNavLink[]
    partner_catalog: StoreOnlineStoreNavLink[]
    footer: {
      company: StoreOnlineStoreNavLink[]
      quickLinks: StoreOnlineStoreNavLink[]
    }
  }
  homepage: {
    heroSlides: StoreHomepageHeroSlide[]
    featuredCategories: StoreHomepageFeaturedCategory[]
  }
}

export type FetchOnlineStoreResult = {
  settings: StoreOnlineStoreSettings | null
  preview: boolean
}

async function getPreviewParams() {
  const headerStore = await headers()
  const previewHeader = headerStore.get("x-online-store-preview")
  const tokenHeader = headerStore.get("x-online-store-preview-token")

  if (previewHeader === "1" && tokenHeader) {
    return { preview: true, token: tokenHeader }
  }

  return { preview: false, token: null as string | null }
}

export async function fetchOnlineStoreSettings(): Promise<FetchOnlineStoreResult> {
  try {
    const { preview, token } = await getPreviewParams()
    const query = preview && token ? `?preview=1&token=${encodeURIComponent(token)}` : ""

    const next = preview
      ? { revalidate: 0 }
      : {
          ...(await getCacheOptions("online-store")),
        }

    const response = await sdk.client.fetch<{
      settings: StoreOnlineStoreSettings
      preview?: boolean
    }>(`/store/online-store${query}`, {
      method: "GET",
      next,
      cache: preview ? "no-store" : "force-cache",
    })

    return {
      settings: response.settings,
      preview: response.preview ?? preview,
    }
  } catch {
    return { settings: null, preview: false }
  }
}
