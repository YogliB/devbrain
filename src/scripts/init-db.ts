/**
 * This script is used to manually initialize the database.
 * It ensures the database exists and seeds it with initial data.
 * The schema is applied automatically using drizzle-kit push.
 *
 * Usage:
 * bun src/scripts/init-db.ts
 */

import { initDb, closeDb } from '../db';
import { spawn } from 'child_process';

async function main() {
	console.log('Manually initializing database...');

	try {
		const pushProcess = spawn('npm', ['run', 'db:push']);

		await new Promise<void>((resolve, reject) => {
			pushProcess.on('close', (code: number) => {
				if (code === 0) {
					console.log('Schema applied successfully');
					resolve();
				} else {
					reject(new Error(`Schema push process exited with code ${code}`));
				}
			});
		});

		await initDb(true);

		console.log('Database initialized successfully');

		const seedProcess = spawn('npm', ['run', 'db:seed']);

		await new Promise<void>((resolve, reject) => {
			seedProcess.on('close', (code: number) => {
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
