import type { Database, SQLQueryBindings } from "bun:sqlite";

import {
  type AbortableOperationOptions,
  CompiledQuery,
  type DatabaseConnection,
  type DatabaseIntrospector,
  type Dialect,
  type Driver,
  type Kysely,
  type QueryResult,
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
} from "kysely";

export interface BunSqliteDialectConfig {
  database: Database;
  onCreateConnection?: (connection: DatabaseConnection) => Promise<void>;
}

class BunSqliteConnection implements DatabaseConnection {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  executeQuery<R>(
    compiledQuery: CompiledQuery,
    _options?: AbortableOperationOptions
  ): Promise<QueryResult<R>> {
    const { parameters, sql } = compiledQuery;
    const stmt = this.#db.prepare(sql);
    const bindings = parameters as SQLQueryBindings[];

    if (stmt.columnNames.length > 0) {
      return Promise.resolve({
        rows: stmt.all(...bindings) as R[],
      });
    }

    const results = stmt.run(...bindings);
    return Promise.resolve({
      insertId: BigInt(results.lastInsertRowid),
      numAffectedRows: BigInt(results.changes),
      rows: [],
    });
  }

  async *streamQuery<R>(
    compiledQuery: CompiledQuery,
    _chunkSize: number,
    _options?: AbortableOperationOptions
  ): AsyncIterableIterator<QueryResult<R>> {
    const { parameters, sql } = compiledQuery;
    const stmt = this.#db.prepare(sql);
    const bindings = parameters as SQLQueryBindings[];

    if (!("iterator" in stmt)) {
      throw new Error("bun:sqlite streaming requires Bun 1.1.31 or newer.");
    }

    for (const row of stmt.iterate(...bindings)) {
      yield { rows: [row as R] };
    }
  }
}

class ConnectionMutex {
  #promise?: Promise<void>;
  #resolve?: () => void;

  async lock(): Promise<void> {
    while (this.#promise) {
      await this.#promise;
    }

    this.#promise = new Promise(resolve => {
      this.#resolve = resolve;
    });
  }

  unlock(): void {
    const resolve = this.#resolve;
    this.#promise = undefined;
    this.#resolve = undefined;
    resolve?.();
  }
}

class BunSqliteDriver implements Driver {
  readonly #config: BunSqliteDialectConfig;
  #connection?: BunSqliteConnection;
  readonly #connectionMutex = new ConnectionMutex();
  #db?: Database;

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config };
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    await this.#connectionMutex.lock();
    return this.#connection!;
  }

  async beginTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("begin"));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("commit"));
  }

  async destroy(): Promise<void> {
    this.#db?.close();
  }

  async init(): Promise<void> {
    this.#db = this.#config.database;
    this.#connection = new BunSqliteConnection(this.#db);

    if (this.#config.onCreateConnection) {
      await this.#config.onCreateConnection(this.#connection);
    }
  }

  async releaseConnection(): Promise<void> {
    this.#connectionMutex.unlock();
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("rollback"));
  }
}

export class BunSqliteDialect implements Dialect {
  readonly #config: BunSqliteDialectConfig;

  constructor(config: BunSqliteDialectConfig) {
    this.#config = { ...config };
  }

  createAdapter() {
    return new SqliteAdapter();
  }

  createDriver(): Driver {
    return new BunSqliteDriver(this.#config);
  }

  createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
    return new SqliteIntrospector(db);
  }

  createQueryCompiler() {
    return new SqliteQueryCompiler();
  }
}
