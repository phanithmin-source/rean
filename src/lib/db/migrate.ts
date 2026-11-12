import { getDb } from "./index";
import path from "path";
import fs from "fs";
import { migrateDirectoryContent } from "./directory-migration";

export async function runMigrations() {
  console.log("Running Rean PostgreSQL migrations...");
  const db = await getDb();

  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (err: any) {
      console.warn("Migration warning:", err.message);
    }
  }

  // Record migration version
  const initialVersion = "20261111_001_initial_schema";
  await db.query(
    "INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING",
    [initialVersion]
  );

  await migrateDirectoryContent(db);
  console.log("Migrations applied successfully!");
}
