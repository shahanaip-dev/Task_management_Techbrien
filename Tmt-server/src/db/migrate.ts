/**
 * Migration runner
 * Reads schema.sql and executes it against the configured database.
 * Run: npm run db:migrate
 */
import fs from 'fs';
import path from 'path';
import { db } from './index';

async function migrate() {
  console.log('\n🔄 Running database migration...\n');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await db.query(sql);
    console.log('✅ Migration successful — all tables created\n');
  } catch (err: any) {
    // Ignore "already exists" errors so re-runs are safe
    if (err.code === '42710' || err.code === '42P07') {
      console.log('ℹ️  Schema already exists — nothing to do\n');
    } else {
      console.error('❌ Migration failed:', err.message);
      process.exit(1);
    }
  } finally {
    await db.end();
  }
}

migrate();
