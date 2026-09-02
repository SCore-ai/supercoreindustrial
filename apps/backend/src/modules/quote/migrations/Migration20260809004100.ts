import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809004100 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "quote" add column if not exists "company_id" text null;`)
    this.addSql(`alter table "quote" add column if not exists "currency_code" text null;`)
    this.addSql(`alter table "quote" add column if not exists "valid_until" timestamptz null;`)
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_quote_company_id" ON "quote" ("company_id") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `alter table "quote_line_item" add column if not exists "unit_price" real null;`
    )
    this.addSql(
      `alter table "quote_line_item" add column if not exists "discount_percent" integer not null default 0;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "quote_line_item" drop column if exists "discount_percent";`)
    this.addSql(`alter table "quote_line_item" drop column if exists "unit_price";`)
    this.addSql(`drop index if exists "IDX_quote_company_id";`)
    this.addSql(`alter table "quote" drop column if exists "valid_until";`)
    this.addSql(`alter table "quote" drop column if exists "currency_code";`)
    this.addSql(`alter table "quote" drop column if exists "company_id";`)
  }
}
