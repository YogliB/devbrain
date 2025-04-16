/**
 * This script is used to manually initialize the database.
 * It runs migrations and seeds the database with initial data.
 *
 * Usage:
 * bun src/scripts/init-db.ts
 */

import { initDb, closeDb } from '../db';

async function main() {
	console.log('Manually initializing database...');

	try {
		// Force migrations to run
		await initDb(true);

		console.log('Database initialized successfully');

		// Run the seed script
		const { spawn } = require('child_process');
		const process = spawn('npm', ['run', 'db:seed']);

		await new Promise<void>((resolve, reject) => {
			process.on('close', (code: number) => {
				if (code === 0) {
					console.log('Database seeded successfully');
					resolve();
				} else {
					reject(new Error(`Seed process exited with code ${code}`));
				}
			});
		});
	} catch (error) {
		console.error('Error initializing database:', error);
		process.exit(1);
	} finally {
		closeDb();
	}
}

main();
