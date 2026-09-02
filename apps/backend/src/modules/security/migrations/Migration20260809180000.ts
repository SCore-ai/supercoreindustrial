import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809180000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "security_settings" (
        "id" text not null,
        "rbac_enforcement_enabled" boolean not null default true,
        "company_scope_enforced" boolean not null default true,
        "admin_mfa_required" boolean not null default false,
        "storefront_mfa_required" boolean not null default false,
        "sso_enabled" boolean not null default false,
        "sso_provider" text check ("sso_provider" in ('saml', 'oauth', 'oidc')) null,
        "rate_limit_enabled" boolean not null default true,
        "rate_limit_store_rpm" integer not null default 120,
        "rate_limit_auth_rpm" integer not null default 20,
        "audit_log_enabled" boolean not null default true,
        "audit_log_retention_days" integer not null default 90,
        "audit_log_external_webhook" text null,
        "pci_tokenization_only" boolean not null default true,
        "db_ssl_required" boolean not null default true,
        "field_encryption_enabled" boolean not null default false,
        "waf_enabled" boolean not null default false,
        "waf_provider" text check ("waf_provider" in ('cloudflare', 'aws', 'other')) null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "security_settings_pkey" primary key ("id")
      );`
    )

    this.addSql(
      `insert into "security_settings" ("id")
       values ('security_settings_default')
       on conflict ("id") do nothing;`
    )

    this.addSql(
      `create table if not exists "audit_log" (
        "id" text not null,
        "actor_type" text check ("actor_type" in ('admin', 'customer', 'b2b_member', 'system')) not null default 'system',
        "actor_id" text null,
        "actor_email" text null,
        "action" text not null,
        "resource_type" text not null,
        "resource_id" text null,
        "company_id" text null,
        "ip_address" text null,
        "user_agent" text null,
        "summary" text null,
        "metadata" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "audit_log_pkey" primary key ("id")
      );`
    )

    this.addSql(
      `create index if not exists "audit_log_action_idx" on "audit_log" ("action");`
    )
    this.addSql(
      `create index if not exists "audit_log_company_id_idx" on "audit_log" ("company_id");`
    )
    this.addSql(
      `create index if not exists "audit_log_created_at_idx" on "audit_log" ("created_at");`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "audit_log" cascade;`)
    this.addSql(`drop table if exists "security_settings" cascade;`)
  }
}
