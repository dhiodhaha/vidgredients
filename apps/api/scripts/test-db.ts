import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

console.log('Testing connection to:', databaseUrl.replace(/:[^:@]+@/, ':***@')); // sensitive info masked

async function test() {
  try {
    const sql = neon(databaseUrl!);
    const result = await sql`SELECT now()`;
    console.log('Connection successful:', result);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

test();
