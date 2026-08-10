import { readFileSync } from 'fs';
import pg from 'pg';
const { Client } = pg;

const env = readFileSync('.env', 'utf8');
const match = env.match(/DATABASE_URL="([^"]+)"/);
if (!match) { console.error('DATABASE_URL not found in .env'); process.exit(1); }

const url = match[1];
console.log('Connecting to:', url.substring(0, 50) + '...');

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  const res = await client.query('SELECT NOW()');
  console.log('✅ DB connection OK:', res.rows[0].now);
  await client.end();
} catch (e) {
  console.error('❌ DB connection FAILED:', e.message);
}
