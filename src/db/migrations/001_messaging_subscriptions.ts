import type { Kysely } from "kysely";

import type { Database } from "@/db/schema.ts";

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("messaging_subscriptions").ifExists().execute();
}

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("messaging_subscriptions")
    .addColumn("id", "text", col => col.primaryKey().notNull())
    .addColumn("fcm_token", "text")
    .addColumn("email", "text")
    .addColumn("study_program_id", "integer", col => col.notNull())
    .addColumn("device_info", "text", col => col.notNull())
    .addColumn("created_at", "text", col => col.notNull())
    .addColumn("last_notified_at", "text")
    .execute();

  await db.schema
    .createIndex("idx_messaging_subscriptions_study_program_id")
    .on("messaging_subscriptions")
    .column("study_program_id")
    .execute();

  await db.schema
    .createIndex("idx_messaging_subscriptions_email_fcm")
    .on("messaging_subscriptions")
    .columns(["email", "fcm_token"])
    .execute();
}
