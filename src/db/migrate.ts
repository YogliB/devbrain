import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'path';
import { getDb, closeDb } from './index';


async function main() {
	console.log('Running migrations...');

	const db = getDb();

	
	migrate(db, { migrationsFolder: join(__dirname, 'migrations') });

	console.log('Migrations completed successfully');

	
	closeDb();
}

main().catch((e) => {
	console.error('Migration failed');
	console.error(e);
	process.exit(1);
});
