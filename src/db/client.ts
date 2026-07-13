import { Database } from "bun:sqlite";
import { Kysely } from "kysely";
import { mkdirSync } from "node:fs";
import path from "node:path";

import type { Database as DbSchema } from "@/db/schema.ts";

import { config } from "@/config.ts";
import { BunSqliteDialect } from "@/db/bun-sqlite-dialect.ts";

export function createDb(filePath: string): Kysely<DbSchema> {
  return createKysely(createSqliteDatabase(filePath));
}

function createKysely(sqlite: Database): Kysely<DbSchema> {
  return new Kysely<DbSchema>({
    dialect: new BunSqliteDialect({
      database: sqlite,
    }),
  });
}

function createSqliteDatabase(filePath: string): Database {
  if (filePath !== ":memory:") {
    mkdirSync(path.dirname(filePath), { recursive: true });
  }

  const sqlite = new Database(filePath, { create: true });
  sqlite.run("PRAGMA journal_mode = WAL;");

  return sqlite;
}

let dbInstance: Kysely<DbSchema> | undefined;
let sqliteInstance: Database | undefined;

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.destroy();
    dbInstance = undefined;
  }

  if (sqliteInstance) {
    sqliteInstance.close();
    sqliteInstance = undefined;
  }
}

export function getDb(): Kysely<DbSchema> {
  if (!dbInstance) {
    sqliteInstance = createSqliteDatabase(config.database.path);
    dbInstance = createKysely(sqliteInstance);
  }
  return dbInstance;
}
