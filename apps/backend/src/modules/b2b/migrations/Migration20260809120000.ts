import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "b2b_settings" (
        "id" text not null,
        "conversations_enabled" boolean not null default true,
        "quotes_enabled" boolean not null default true,
        "order_approval_enabled" boolean not null default true,
        "tiered_pricing_enabled" boolean not null default true,
        "purchase_lists_enabled" boolean not null default false,
        "bulk_order_form_enabled" boolean not null default false,
        "registration_mode" text check ("registration_mode" in ('quote_submit', 'dedicated_form', 'both')) not null default 'both',
        "auto_approve_registrations" boolean not null default false,
        "default_require_order_approval" boolean not null default true,
        "trade_registration_path" text not null default '/register-trade',
        "hide_prices_for_guests" boolean not null default false,
        "notify_on_registration" boolean not null default true,
        "notify_on_quote_submit" boolean not null default true,
        "notify_on_offer_sent" boolean not null default true,
        "notify_on_order_approval" boolean not null default true,
        "zoho_sync_on_offer" boolean not null default true,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "b2b_settings_pkey" primary key ("id")
      );`
    )

    this.addSql(
      `insert into "b2b_settings" ("id")
       values ('b2b_settings_default')
       on conflict ("id") do nothing;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_settings" cascade;`)
  }
}
