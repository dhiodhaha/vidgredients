import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load environment variables from .dev.vars if present, or system env
dotenv.config({ path: '.dev.vars' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
