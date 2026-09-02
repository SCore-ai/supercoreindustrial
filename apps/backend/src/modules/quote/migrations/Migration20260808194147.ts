import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260808194147 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "quote" ("id" text not null, "status" text check ("status" in ('draft', 'submitted')) not null default 'draft', "email" text null, "customer_id" text null, "company" text null, "project" text null, "notes" text null, "region_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_deleted_at" ON "quote" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "quote_line_item" ("id" text not null, "quote_id" text not null, "variant_id" text not null, "product_id" text null, "quantity" integer not null default 1, "sku" text null, "mpn" text null, "title" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "quote_line_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_quote_line_item_deleted_at" ON "quote_line_item" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "quote" cascade;`);

    this.addSql(`drop table if exists "quote_line_item" cascade;`);
  }

}
