import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const devVarsPath = path.resolve(__dirname, '../.dev.vars');
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl && fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, 'utf8');
    const match = content.match(/DATABASE_URL=(.+)/);
    if (match) {
      databaseUrl = match[1].trim();
    }
  }

  if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment or .dev.vars');
    process.exit(1);
  }
  const sql = neon(databaseUrl);

  const schemaPath = path.resolve(__dirname, '../src/db/better-auth-schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  try {
    // Split by semicolon to run statements individually if needed,
    // but neon helper might handle multiple statements.
    // Let's try sending the whole block first.
    await sql(schemaSql);
  } catch (error) {
    console.error('Error applying schema:', error);
    process.exit(1);
  }
}

main();
