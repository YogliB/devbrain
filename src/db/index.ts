import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'path';
import { existsSync } from 'fs';

let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export function getDbPath() {
	return process.env.DATABASE_URL || join(process.cwd(), 'devbrain.db');
}

export function getDb() {
	if (db) return db;

	const dbPath = getDbPath();

	sqlite = new Database(dbPath);

	db = drizzle(sqlite, { schema });

	return db;
}

export function ensureDatabaseExists() {
	const dbPath = getDbPath();

	// Check if database file exists
	if (!existsSync(dbPath)) {
		console.log('Database file does not exist, creating it...');
		// Create the database file by opening and closing a connection
		const tempDb = new Database(dbPath);
		tempDb.close();
		return false; // Database didn't exist before
	}

	return true; // Database already existed
}

export function closeDb() {
	if (sqlite) {
		sqlite.close();
		sqlite = null;
		db = null;
	}
}

export async function initDb(forceMigrate = false) {
	const dbExisted = ensureDatabaseExists();
	const db = getDb();

	// Only run migrations if the database didn't exist or if forceMigrate is true
	if (!dbExisted || forceMigrate) {
		console.log('Running database migrations...');
		migrate(db, { migrationsFolder: join(process.cwd(), 'src/db/migrations') });
	}

	return db;
}
