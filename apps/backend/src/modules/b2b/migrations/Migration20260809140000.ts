import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809140000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "b2b_settings" add column if not exists "email_enabled" boolean not null default false;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "email_from" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "email_admin" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "smtp_host" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "smtp_port" integer not null default 587;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "smtp_user" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "smtp_pass" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "smtp_secure" boolean not null default false;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "b2b_settings" drop column if exists "email_enabled";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "email_from";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "email_admin";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "smtp_host";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "smtp_port";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "smtp_user";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "smtp_pass";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "smtp_secure";`)
  }
}
