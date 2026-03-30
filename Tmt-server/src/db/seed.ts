/**
 * Database Seed Script
 * Run: npm run db:seed
 * Creates minimal login user for initial access.
 */
import bcrypt from 'bcryptjs';
import { db } from './index';

async function seed() {
  console.log('\n🌱 Seeding database...\n');

  // ── Users ─────────────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 12);

  await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`,
    ['System Admin', 'admin@tmt.com', adminHash, 'ADMIN']
  );

  console.log('✅ Admin user ensured');
  console.log('\n🎉 Seed complete!\n');
  console.log('────────────────────────────────────────');
  console.log('  Admin:  admin@tmt.com  / Admin@123');
  console.log('────────────────────────────────────────\n');

  await db.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
