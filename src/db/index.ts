import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
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

	if (!existsSync(dbPath)) {
		console.log('Database file does not exist, creating it...');
		const tempDb = new Database(dbPath);
		tempDb.close();
		return false;
	}

	return true;
}

export function closeDb() {
	if (sqlite) {
		sqlite.close();
		sqlite = null;
		db = null;
	}
}

export async function initDb(forceInit = false) {
	const dbExisted = ensureDatabaseExists();
	const db = getDb();

	if (!dbExisted || forceInit) {
		console.log('Database initialized');
	}

	return db;
}
