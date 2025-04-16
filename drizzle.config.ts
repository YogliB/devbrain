import type { Config } from 'drizzle-kit';
import { join } from 'path';

export default {
  schema: './src/db/schema',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: join(process.cwd(), 'devbrain.db'),
  },
} satisfies Config;
