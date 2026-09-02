import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825170000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      alter table if exists "online_store_settings"
        add column if not exists "partner_catalog" jsonb null;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`
      alter table if exists "online_store_settings"
        drop column if exists "partner_catalog";
    `)
  }
}
