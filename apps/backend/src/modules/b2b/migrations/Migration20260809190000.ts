import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260809190000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "b2b_conversation" drop constraint if exists "b2b_conversation_status_check";`
    )
    this.addSql(
      `alter table "b2b_conversation" add constraint "b2b_conversation_status_check" check ("status" in ('open', 'closed', 'archived'));`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "b2b_conversation" set "status" = 'closed' where "status" = 'archived';`
    )
    this.addSql(
      `alter table "b2b_conversation" drop constraint if exists "b2b_conversation_status_check";`
    )
    this.addSql(
      `alter table "b2b_conversation" add constraint "b2b_conversation_status_check" check ("status" in ('open', 'closed'));`
    )
  }
}
