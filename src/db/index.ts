import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

let db: ReturnType<typeof drizzle> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export function getConnectionString() {
	return process.env.DATABASE_URL;
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

		// Initialize RLS settings
		try {
			// Create the app.current_user_id setting if it doesn't exist
			await dbInstance.execute(sql`
				DO $$
				BEGIN
					-- Check if the setting exists
					IF NOT EXISTS (
						SELECT 1 FROM pg_settings WHERE name = 'app.current_user_id'
					) THEN
						-- If it doesn't exist, try to create it
						PERFORM set_config('app.current_user_id', '', false);
					END IF;
				EXCEPTION WHEN OTHERS THEN
					-- If there's an error, it might be because custom settings need to be registered
					NULL;
				END $$;
			`);
		} catch (rlsError) {
			console.warn(
				'Note: RLS initialization will be handled during setup:',
				rlsError,
			);
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

/**
 * Sets the current user ID for the database session
 * This is used by RLS policies to filter data
 */
export async function setCurrentUser(userId: string) {
	const dbInstance = getDb();

	try {
		await dbInstance.execute(
			sql`SELECT set_config('app.current_user_id', ${userId}, false)`,
		);
		console.log(`Set current user ID to: ${userId}`);
	} catch (error) {
		console.error(
			'Error setting current user for database session:',
			error,
		);
		throw error;
	}
}
