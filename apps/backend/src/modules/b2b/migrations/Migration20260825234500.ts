import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825234500 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `update "b2b_settings"
       set "bulk_order_form_enabled" = true
       where "id" = 'b2b_settings_default';`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "b2b_settings"
       set "bulk_order_form_enabled" = false
       where "id" = 'b2b_settings_default';`
    )
  }
}
