import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809200000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "fx_rate" (
        "id" text not null,
        "from_currency" text not null,
        "to_currency" text not null,
        "rate" real not null,
        "source" text not null default 'manual',
        "is_active" boolean not null default true,
        "notes" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "fx_rate_pkey" primary key ("id")
      );
    `)

    this.addSql(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fx_rate_pair_unique"
      ON "fx_rate" ("from_currency", "to_currency")
      WHERE deleted_at IS NULL;
    `)

    this.addSql(`
      create table if not exists "catalog_import_job" (
        "id" text not null,
        "manufacturer" text not null,
        "source_currency" text not null default 'eur',
        "target_currency" text not null default 'gbp',
        "status" text check ("status" in ('draft', 'previewed', 'running', 'completed', 'failed')) not null default 'draft',
        "filename" text null,
        "total_rows" integer not null default 0,
        "imported_count" integer not null default 0,
        "skipped_count" integer not null default 0,
        "error_count" integer not null default 0,
        "fx_rate_used" real null,
        "summary" jsonb null,
        "error_log" jsonb null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "catalog_import_job_pkey" primary key ("id")
      );
    `)

    // Seed GBP-centric pairs (editable in admin). Values are illustrative defaults.
    this.addSql(`
      insert into "fx_rate" ("id", "from_currency", "to_currency", "rate", "source", "notes")
      values
        ('fx_eur_gbp', 'eur', 'gbp', 0.8600, 'seed', '1 EUR = 0.86 GBP'),
        ('fx_gbp_eur', 'gbp', 'eur', 1.1628, 'seed', '1 GBP = 1.1628 EUR'),
        ('fx_usd_gbp', 'usd', 'gbp', 0.7900, 'seed', '1 USD = 0.79 GBP'),
        ('fx_gbp_usd', 'gbp', 'usd', 1.2658, 'seed', '1 GBP = 1.2658 USD'),
        ('fx_eur_usd', 'eur', 'usd', 1.0886, 'seed', '1 EUR = 1.0886 USD'),
        ('fx_usd_eur', 'usd', 'eur', 0.9186, 'seed', '1 USD = 0.9186 EUR')
      on conflict ("id") do nothing;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "catalog_import_job" cascade;`)
    this.addSql(`drop table if exists "fx_rate" cascade;`)
  }
}
