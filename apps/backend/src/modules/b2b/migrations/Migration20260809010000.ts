import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809010000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "b2b_company" add column if not exists "require_order_approval" boolean not null default true;`
    )

    this.addSql(
      `create table if not exists "b2b_order_approval" ("id" text not null, "order_id" text not null, "company_id" text not null, "requested_by_member_id" text null, "approved_by_member_id" text null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "notes" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_order_approval_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_order_approval_order_id" ON "b2b_order_approval" ("order_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_order_approval_status" ON "b2b_order_approval" ("status") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "b2b_conversation" ("id" text not null, "company_id" text null, "quote_id" text null, "order_id" text null, "subject" text not null, "status" text check ("status" in ('open', 'closed')) not null default 'open', "created_by" text check ("created_by" in ('admin', 'customer')) not null default 'customer', "customer_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_conversation_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_conversation_quote_id" ON "b2b_conversation" ("quote_id") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "b2b_message" ("id" text not null, "conversation_id" text not null, "sender_type" text check ("sender_type" in ('admin', 'customer', 'system')) not null default 'customer', "sender_id" text null, "sender_name" text null, "body" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_message_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_message_conversation_id" ON "b2b_message" ("conversation_id") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "b2b_pricing_tier" ("id" text not null, "name" text not null, "customer_group_id" text null, "variant_id" text null, "product_id" text null, "min_quantity" integer not null default 1, "max_quantity" integer null, "unit_price" real null, "currency_code" text not null default 'gbp', "discount_percent" integer not null default 0, "priority" integer not null default 0, "status" text check ("status" in ('active', 'disabled')) not null default 'active', "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_pricing_tier_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_pricing_tier_variant_id" ON "b2b_pricing_tier" ("variant_id") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_pricing_tier" cascade;`)
    this.addSql(`drop table if exists "b2b_message" cascade;`)
    this.addSql(`drop table if exists "b2b_conversation" cascade;`)
    this.addSql(`drop table if exists "b2b_order_approval" cascade;`)
    this.addSql(
      `alter table "b2b_company" drop column if exists "require_order_approval";`
    )
  }
}
