import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export function getConnectionString() {
	return (
		process.env.DATABASE_URL ||
		'postgres://postgres:postgres@localhost:5432/devbrain'
	);
}

export function getDb() {
	if (db) return db;

	try {
		const connectionString = getConnectionString();
		console.log(
			`Connecting to PostgreSQL database at: ${connectionString}`,
		);

		// Create a new postgres client
		client = postgres(connectionString, { max: 10 });
		db = drizzle(client, { schema });

		return db;
	} catch (error) {
		console.error('Error connecting to PostgreSQL database:', error);
		throw error;
	}
}

export function closeDb() {
	if (client) {
		// Close the postgres client
		client.end();
		client = null;
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

		const dbInstance = getDb();
		console.log('PostgreSQL database initialized');

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
