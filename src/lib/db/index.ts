import path from "path";
import fs from "fs";

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface DbClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  transaction<T>(cb: (client: DbClient) => Promise<T>): Promise<T>;
}

declare global {
  // eslint-disable-next-line no-var
  var __rean_db_instance: DbClient | undefined;
  // eslint-disable-next-line no-var
  var __rean_db_promise: Promise<DbClient> | undefined;
}

async function createClient(): Promise<DbClient> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.startsWith("file:")) {
    // Standard PostgreSQL via pg Pool
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
    });

    const client: DbClient = {
      async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
        const res = await pool.query(sql, params);
        return {
          rows: res.rows as T[],
          rowCount: res.rowCount ?? res.rows.length,
        };
      },
      async transaction<T>(cb: (c: DbClient) => Promise<T>): Promise<T> {
        const conn = await pool.connect();
        try {
          await conn.query("BEGIN");
          const txClient: DbClient = {
            async query<R = any>(sql: string, params?: any[]): Promise<QueryResult<R>> {
              const res = await conn.query(sql, params);
              return {
                rows: res.rows as R[],
                rowCount: res.rowCount ?? res.rows.length,
              };
            },
            async transaction() {
              throw new Error("Nested transactions not supported");
            },
          };
          const result = await cb(txClient);
          await conn.query("COMMIT");
          return result;
        } catch (err) {
          await conn.query("ROLLBACK");
          throw err;
        } finally {
          conn.release();
        }
      },
    };
    return client;
  }

  // Embedded PostgreSQL via PGlite with persistent disk storage
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = path.join(process.cwd(), "data", "rean-pgdata");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir);
  await pglite.waitReady;

  const client: DbClient = {
    async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
      const res = await pglite.query(sql, params);
      return {
        rows: res.rows as T[],
        rowCount: res.rows.length,
      };
    },
    async transaction<T>(cb: (c: DbClient) => Promise<T>): Promise<T> {
      return await pglite.transaction(async (tx) => {
        const txClient: DbClient = {
          async query<R = any>(sql: string, params?: any[]): Promise<QueryResult<R>> {
            const res = await tx.query(sql, params);
            return {
              rows: res.rows as R[],
              rowCount: res.rows.length,
            };
          },
          async transaction() {
            throw new Error("Nested transactions not supported");
          },
        };
        return await cb(txClient);
      });
    },
  };

  return client;
}

export async function getDb(): Promise<DbClient> {
  if (globalThis.__rean_db_instance) {
    return globalThis.__rean_db_instance;
  }

  if (!globalThis.__rean_db_promise) {
    globalThis.__rean_db_promise = (async () => {
      const db = await createClient();
      await runMigrationsInternal(db);
      globalThis.__rean_db_instance = db;
      return db;
    })();
  }

  return await globalThis.__rean_db_promise;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
  const db = await getDb();
  return db.query<T>(sql, params);
}

export async function transaction<T>(cb: (client: DbClient) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction(cb);
}

async function runMigrationsInternal(db: DbClient) {
  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  if (!fs.existsSync(schemaPath)) return;

  const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (err: any) {
      console.warn("Migration notice:", statement.slice(0, 40), err.message);
    }
  }
}
