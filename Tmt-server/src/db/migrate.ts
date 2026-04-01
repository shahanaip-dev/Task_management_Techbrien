/**
 * Migration runner — idempotent, splits statements individually.
 * Run: npm run db:migrate
 */
import fs from 'fs';
import path from 'path';
import { db } from './index';

async function migrate() {
  console.log('\n🔄 Running database migration...\n');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  // Split on semicolons (skip empty chunks) and run each statement individually
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let errors = 0;
  for (const stmt of statements) {
    try {
      await db.query(stmt);
    } catch (err: any) {
      // 42710 = duplicate_object (enum), 42P07 = duplicate_table, 42701 = duplicate_column
      if (['42710', '42P07', '42701'].includes(err.code)) {
        // silently skip — already exists
      } else {
        console.error('❌ Statement failed:', err.message, '\n  SQL:', stmt.substring(0, 80));
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log('✅ Migration complete — all statements applied\n');
  } else {
    console.log(`⚠️  Migration finished with ${errors} error(s)\n`);
  }

  await db.end();
}

migrate();
