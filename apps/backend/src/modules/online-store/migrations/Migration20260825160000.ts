import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825160000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table if exists "online_store_settings"
        add column if not exists "homepage" jsonb null,
        add column if not exists "draft_payload" jsonb null,
        add column if not exists "has_unpublished_changes" boolean not null default false,
        add column if not exists "published_at" timestamptz null;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`
      alter table if exists "online_store_settings"
        drop column if exists "homepage",
        drop column if exists "draft_payload",
        drop column if exists "has_unpublished_changes",
        drop column if exists "published_at";
    `)
  }
}
