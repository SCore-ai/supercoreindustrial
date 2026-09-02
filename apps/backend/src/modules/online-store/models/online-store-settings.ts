import { model } from "@medusajs/framework/utils"

const OnlineStoreSettings = model.define("online_store_settings", {
  id: model.id().primaryKey(),
  theme_name: model.text().default("Supercore Industrial"),
  theme_version: model.text().default("1.0.0"),
  storefront_url: model.text().nullable(),
  colors: model.json().nullable(),
  typography: model.json().nullable(),
  layout: model.json().nullable(),
  mega_menu_layout: model.json().nullable(),
  announcement: model.json().nullable(),
  main_navigation: model.json().nullable(),
  contact_menu: model.json().nullable(),
  footer: model.json().nullable(),
  partner_catalog: model.json().nullable(),
  homepage: model.json().nullable(),
  custom_css: model.text().nullable(),
  draft_payload: model.json().nullable(),
  has_unpublished_changes: model.boolean().default(false),
  published_at: model.dateTime().nullable(),
  metadata: model.json().nullable(),
})

export default OnlineStoreSettings
