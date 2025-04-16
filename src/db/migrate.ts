import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'path';
import { getDb } from './index';

// Run migrations
async function main() {
  console.log('Running migrations...');
  
  const db = getDb();
  
  // Run the migrations
  migrate(db, { migrationsFolder: join(__dirname, 'migrations') });
  
  console.log('Migrations completed successfully');
}

main().catch((e) => {
  console.error('Migration failed');
  console.error(e);
  process.exit(1);
});
