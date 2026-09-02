import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809160000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "b2b_company" drop constraint if exists "b2b_company_status_check";`)
    this.addSql(
      `alter table "b2b_company" add constraint "b2b_company_status_check" check ("status" in ('pending', 'approved', 'rejected', 'suspended', 'archived'));`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "b2b_company" set "status" = 'suspended' where "status" = 'archived';`
    )
    this.addSql(`alter table "b2b_company" drop constraint if exists "b2b_company_status_check";`)
    this.addSql(
      `alter table "b2b_company" add constraint "b2b_company_status_check" check ("status" in ('pending', 'approved', 'rejected', 'suspended'));`
    )
  }
}
