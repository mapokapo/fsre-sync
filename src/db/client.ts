import { CompiledQuery, Kysely } from "kysely";
import { BunWorkerDialect } from "kysely-bun-worker";
import { mkdirSync } from "node:fs";
import path from "node:path";

import type { Database as DbSchema } from "@/db/schema.ts";

import { config } from "@/lib/config";

export function createDb(filePath: string): Kysely<DbSchema> {
  if (filePath !== ":memory:") {
    mkdirSync(path.dirname(filePath), { recursive: true });
  }

  return new Kysely<DbSchema>({
    dialect: new BunWorkerDialect({
      onCreateConnection: async connection => {
        await connection.executeQuery(
          CompiledQuery.raw("PRAGMA journal_mode = WAL;")
        );
      },
      url: filePath,
    }),
  });
}

let dbInstance: Kysely<DbSchema> | undefined;

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = undefined;
  }
}

export function getDb(): Kysely<DbSchema> {
  dbInstance ??= createDb(config.database.path);
  return dbInstance;
}
