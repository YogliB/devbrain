import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'path';

// Use a singleton pattern to ensure we only have one database connection
let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export function getDb() {
  if (db) return db;

  // Determine the database path
  const dbPath = process.env.DATABASE_URL || join(process.cwd(), 'devbrain.db');

  // Create a new database connection
  sqlite = new Database(dbPath);

  // Create the database instance
  db = drizzle(sqlite, { schema });

  return db;
}

export function closeDb() {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
  }
}

export async function initDb() {
  const db = getDb();

  // Run migrations
  migrate(db, { migrationsFolder: join(process.cwd(), 'src/db/migrations') });

  return db;
}
