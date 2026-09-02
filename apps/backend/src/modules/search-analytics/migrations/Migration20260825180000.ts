import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260825180000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "search_query_event" (
        "id" text not null,
        "query" text not null,
        "normalized_query" text not null,
        "result_count" integer not null default 0,
        "mpn_only" boolean not null default false,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "search_query_event_pkey" primary key ("id")
      );
    `)

    this.addSql(`
      create index if not exists "IDX_search_query_event_normalized_query"
      on "search_query_event" ("normalized_query")
      where deleted_at is null;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "search_query_event" cascade;`)
  }
}
