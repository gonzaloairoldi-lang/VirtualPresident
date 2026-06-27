import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "../../../../packages/db/game.db");
const SCHEMA_PATH = join(__dirname, "../../../../packages/db/schema.sql");

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    const schema = readFileSync(SCHEMA_PATH, "utf-8");
    _db.exec(schema);
  }
  return _db;
}
