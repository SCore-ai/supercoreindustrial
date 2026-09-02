import { MedusaService } from "@medusajs/framework/utils"
import {
  applyDraftOverlay,
  applyHomepageUpdate,
  applyNavigationUpdate,
  applyThemeUpdate,
  buildDraftPatch,
  DEFAULT_CONTACT_MENU,
  DEFAULT_FOOTER,
  DEFAULT_MAIN_NAVIGATION,
  DEFAULT_PARTNER_CATALOG,
  draftToPublishedColumns,
  resolveOnlineStoreSettings,
} from "../../lib/online-store/defaults"
import type {
  OnlineStoreDraftPayload,
  OnlineStoreSettingsRecord,
  ResolvedOnlineStoreSettings,
  UpdateOnlineStoreHomepagePayload,
  UpdateOnlineStoreNavigationPayload,
  UpdateOnlineStoreThemePayload,
} from "../../lib/online-store/types"
import { ONLINE_STORE_SETTINGS_ID } from "../../lib/online-store/types"
import OnlineStoreSettings from "./models/online-store-settings"

class OnlineStoreModuleService extends MedusaService({
  OnlineStoreSettings,
}) {
  async ensureDefaultSettings(): Promise<OnlineStoreSettingsRecord> {
    const [existing] = await this.listOnlineStoreSettings(
      { id: ONLINE_STORE_SETTINGS_ID },
      { take: 1 }
    )

    if (existing) {
      return existing as OnlineStoreSettingsRecord
    }

    const [created] = await this.createOnlineStoreSettings([
      {
        id: ONLINE_STORE_SETTINGS_ID,
        theme_name: "Supercore Industrial",
        theme_version: "1.0.0",
        storefront_url: process.env.STOREFRONT_URL ?? "http://localhost:8000",
        has_unpublished_changes: false,
        published_at: new Date(),
      },
    ])

    return created as OnlineStoreSettingsRecord
  }

  private resolveFromRecord(
    record: OnlineStoreSettingsRecord,
    preview = false
  ): ResolvedOnlineStoreSettings {
    const published = resolveOnlineStoreSettings(record)
    if (!preview || !record.draft_payload) {
      return published
    }
    return applyDraftOverlay(published, record.draft_payload)
  }

  async getResolvedSettings(options?: {
    preview?: boolean
  }): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()
    return this.resolveFromRecord(record, options?.preview ?? false)
  }

  async getAdminSettings(): Promise<ResolvedOnlineStoreSettings> {
    return this.getResolvedSettings({ preview: true })
  }

  async getPublishStatus() {
    const record = await this.ensureDefaultSettings()
    return {
      has_unpublished_changes: record.has_unpublished_changes ?? false,
      published_at:
        typeof record.published_at === "string"
          ? record.published_at
          : record.published_at?.toISOString?.(),
      draft_payload: record.draft_payload,
    }
  }

  private async saveDraftPatch(
    patch: OnlineStoreDraftPayload
  ): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()
    const draft = buildDraftPatch(record.draft_payload, patch)

    const [updated] = await this.updateOnlineStoreSettings([
      {
        id: ONLINE_STORE_SETTINGS_ID,
        draft_payload: draft,
        has_unpublished_changes: true,
      },
    ])

    return this.resolveFromRecord(updated as OnlineStoreSettingsRecord, true)
  }

  async updateTheme(
    payload: UpdateOnlineStoreThemePayload
  ): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()
    const current = this.resolveFromRecord(record, true)
    const next = applyThemeUpdate(current, payload)

    return this.saveDraftPatch({
      theme_name: next.theme_name,
      theme_version: next.theme_version,
      storefront_url: next.storefront_url,
      colors: next.colors,
      typography: next.typography,
      layout: next.layout,
      mega_menu_layout: next.mega_menu_layout,
      announcement: next.announcement,
      custom_css: next.custom_css,
    })
  }

  async updateNavigation(
    payload: UpdateOnlineStoreNavigationPayload
  ): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()
    const current = this.resolveFromRecord(record, true)
    const next = applyNavigationUpdate(current, payload)

    return this.saveDraftPatch({
      main_navigation: next.main_navigation,
      contact_menu: next.contact_menu,
      partner_catalog: next.partner_catalog,
      footer: next.footer,
    })
  }

  async updateHomepage(
    payload: UpdateOnlineStoreHomepagePayload
  ): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()
    const current = this.resolveFromRecord(record, true)
    const next = applyHomepageUpdate(current, payload)

    return this.saveDraftPatch({
      homepage: next.homepage,
    })
  }

  async publish(): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()
    const merged = this.resolveFromRecord(record, true)
    const columns = draftToPublishedColumns(merged)

    const [updated] = await this.updateOnlineStoreSettings([
      {
        id: ONLINE_STORE_SETTINGS_ID,
        ...columns,
        draft_payload: null,
        has_unpublished_changes: false,
        published_at: new Date(),
      },
    ])

    return resolveOnlineStoreSettings(updated as OnlineStoreSettingsRecord)
  }

  async discardDraft(): Promise<ResolvedOnlineStoreSettings> {
    const record = await this.ensureDefaultSettings()

    const [updated] = await this.updateOnlineStoreSettings([
      {
        id: ONLINE_STORE_SETTINGS_ID,
        draft_payload: null,
        has_unpublished_changes: false,
      },
    ])

    return resolveOnlineStoreSettings(updated as OnlineStoreSettingsRecord)
  }

  async resetNavigationToDefaults(): Promise<ResolvedOnlineStoreSettings> {
    return this.saveDraftPatch({
      main_navigation: DEFAULT_MAIN_NAVIGATION,
      contact_menu: DEFAULT_CONTACT_MENU,
      partner_catalog: DEFAULT_PARTNER_CATALOG,
      footer: DEFAULT_FOOTER,
    })
  }
}

export default OnlineStoreModuleService
