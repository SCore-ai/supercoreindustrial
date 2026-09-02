import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825223000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_legal_name" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_address" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_phone" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_email" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_vat_number" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_registration_number" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_iban" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_bank" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_bic" text null;`
    )
    this.addSql(
      `alter table "b2b_settings" add column if not exists "company_payment_term" text null;`
    )
    this.addSql(
      `update "b2b_settings"
       set
         "company_legal_name" = coalesce("company_legal_name", 'SUPERCORE AI SYSTEMS LTD.'),
         "company_address" = coalesce(
           "company_address",
           '140 Goswell Road, Technique Building, Unit 3' || chr(10) ||
           'London' || chr(10) ||
           'EC1V 7DY' || chr(10) ||
           'United Kingdom'
         ),
         "company_phone" = coalesce("company_phone", '+44 203 307 5298'),
         "company_email" = coalesce("company_email", 'service@supercoreai.co.uk'),
         "company_vat_number" = coalesce("company_vat_number", 'GB454 3803 92'),
         "company_registration_number" = coalesce("company_registration_number", '14447351'),
         "company_payment_term" = coalesce("company_payment_term", 'Prepayment')
       where "id" = 'b2b_settings_default';`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "b2b_settings" drop column if exists "company_legal_name";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "company_address";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "company_phone";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "company_email";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "company_vat_number";`)
    this.addSql(
      `alter table "b2b_settings" drop column if exists "company_registration_number";`
    )
    this.addSql(`alter table "b2b_settings" drop column if exists "company_iban";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "company_bank";`)
    this.addSql(`alter table "b2b_settings" drop column if exists "company_bic";`)
    this.addSql(
      `alter table "b2b_settings" drop column if exists "company_payment_term";`
    )
  }
}
