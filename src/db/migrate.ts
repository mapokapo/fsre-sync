import { FileMigrationProvider, Migrator } from "kysely/migration";
import { promises as fs } from "node:fs";
import path from "node:path";

import { getDb } from "@/db/client.ts";
import { logger } from "@/lib/logger.ts";

export async function migrateToLatest(): Promise<void> {
  const migrator = new Migrator({
    db: getDb(),
    provider: new FileMigrationProvider({
      fs,
      migrationFolder: path.join(import.meta.dir, "migrations"),
      path,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  for (const result of results ?? []) {
    if (result.status === "Success") {
      logger.info(`Migration "${result.migrationName}" executed successfully`);
    } else if (result.status === "Error") {
      logger.error(`Migration "${result.migrationName}" failed`);
    }
  }

  if (error) {
    if (error instanceof Error) throw error;
    throw new Error("Migration failed", { cause: error });
  }
}
