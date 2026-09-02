import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "online_store_settings" (
        "id" text not null,
        "theme_name" text not null default 'Supercore Industrial',
        "theme_version" text not null default '1.0.0',
        "storefront_url" text null,
        "colors" jsonb null,
        "typography" jsonb null,
        "layout" jsonb null,
        "mega_menu_layout" jsonb null,
        "announcement" jsonb null,
        "main_navigation" jsonb null,
        "contact_menu" jsonb null,
        "footer" jsonb null,
        "custom_css" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "online_store_settings_pkey" primary key ("id")
      );
    `)

    this.addSql(`
      insert into "online_store_settings" ("id", "storefront_url")
      values ('online_store_settings', 'http://localhost:8000')
      on conflict ("id") do nothing;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "online_store_settings" cascade;`)
  }
}
