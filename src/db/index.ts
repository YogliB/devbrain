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

	try {
		const dbPath = getDbPath();
		console.log(`Opening database at: ${dbPath}`);

		sqlite = new Database(dbPath);
		db = drizzle(sqlite, { schema });

		return db;
	} catch (error) {
		console.error('Error opening database:', error);
		throw error;
	}
}

export function ensureDatabaseExists() {
	const dbPath = getDbPath();

	try {
		if (!existsSync(dbPath)) {
			console.log('Database file does not exist, creating it...');
			try {
				const tempDb = new Database(dbPath);
				tempDb.close();
				console.log('Empty database file created successfully');
				return false;
			} catch (error) {
				console.error('Error creating database file:', error);
				throw error;
			}
		}

		// Verify the database file is valid by opening it
		try {
			const testDb = new Database(dbPath, { readonly: true });
			testDb.close();
			console.log('Database file exists and is valid');
		} catch (error) {
			console.error('Database file exists but is invalid:', error);
			// If the database file is corrupted, delete it and create a new one
			console.log('Recreating database file...');
			try {
				const tempDb = new Database(dbPath);
				tempDb.close();
				console.log('Database file recreated successfully');
				return false;
			} catch (innerError) {
				console.error('Error recreating database file:', innerError);
				throw innerError;
			}
		}

		return true;
	} catch (error) {
		console.error('Error in ensureDatabaseExists:', error);
		throw error;
	}
}

export function closeDb() {
	if (sqlite) {
		sqlite.close();
		sqlite = null;
		db = null;
	}
}

export async function initDb(forceInit = false) {
	try {
		if (db && !forceInit) {
			return db;
		}

		if (forceInit) {
			closeDb();
		}

		const dbExisted = ensureDatabaseExists();

		const dbInstance = getDb();

		if (!dbExisted || forceInit) {
			console.log('Database initialized');
		}

		return dbInstance;
	} catch (error) {
		console.error('Error in initDb:', error);

		try {
			return getDb();
		} catch (innerError) {
			console.error('Failed to get database connection:', innerError);
			throw innerError;
		}
	}
}
