import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export function getDbPath() {
	// If DATABASE_URL starts with 'postgres://', use the default SQLite path
	const dbUrl = process.env.DATABASE_URL;
	if (dbUrl && dbUrl.startsWith('postgres://')) {
		console.log(
			'PostgreSQL URL detected, but using SQLite. Using default SQLite path.',
		);
		return join(process.cwd(), 'devbrain.db');
	}
	return dbUrl || join(process.cwd(), 'devbrain.db');
}

export function getDb() {
	if (db) return db;

	try {
		const dbPath = getDbPath();
		console.log(`Opening database at: ${dbPath}`);

		// Ensure the directory exists
		const dbDir = dirname(dbPath);
		if (!existsSync(dbDir)) {
			console.log(`Creating database directory: ${dbDir}`);
			mkdirSync(dbDir, { recursive: true });
		}

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
		// Ensure the directory exists
		const dbDir = dirname(dbPath);
		if (!existsSync(dbDir)) {
			console.log(`Creating database directory: ${dbDir}`);
			mkdirSync(dbDir, { recursive: true });
		}

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

		// Make sure the database directory exists
		const dbPath = getDbPath();
		const dbDir = dirname(dbPath);
		if (!existsSync(dbDir)) {
			console.log(`Creating database directory: ${dbDir}`);
			mkdirSync(dbDir, { recursive: true });
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
