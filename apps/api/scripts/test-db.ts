import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .dev.vars manually since dotenv doesn't parse it by default appropriately with this setup sometimes
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
  console.error('DATABASE_URL not found');
  process.exit(1);
}

async function test() {
  try {
    const sql = neon(databaseUrl!);
    const _result = await sql`SELECT now()`;
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

test();
