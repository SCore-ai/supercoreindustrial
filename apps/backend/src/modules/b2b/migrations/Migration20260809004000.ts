import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809004000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table if not exists "b2b_company" ("id" text not null, "name" text not null, "legal_name" text null, "email" text not null, "phone" text null, "vat_number" text null, "registration_number" text null, "website" text null, "country_code" text null, "status" text check ("status" in ('pending', 'approved', 'rejected', 'suspended')) not null default 'pending', "customer_group_id" text null, "primary_customer_id" text null, "approved_at" timestamptz null, "rejected_at" timestamptz null, "admin_notes" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_company_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_company_deleted_at" ON "b2b_company" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_company_status" ON "b2b_company" ("status") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_company_email" ON "b2b_company" ("email") WHERE deleted_at IS NULL;`
    )

    this.addSql(
      `create table if not exists "b2b_company_member" ("id" text not null, "company_id" text not null, "customer_id" text null, "email" text null, "first_name" text null, "last_name" text null, "role" text check ("role" in ('admin', 'buyer', 'approver')) not null default 'buyer', "status" text check ("status" in ('active', 'invited', 'disabled')) not null default 'active', "is_primary" boolean not null default false, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "b2b_company_member_pkey" primary key ("id"));`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_company_member_deleted_at" ON "b2b_company_member" ("deleted_at") WHERE deleted_at IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_b2b_company_member_company_id" ON "b2b_company_member" ("company_id") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "b2b_company_member" cascade;`)
    this.addSql(`drop table if exists "b2b_company" cascade;`)
  }
}
