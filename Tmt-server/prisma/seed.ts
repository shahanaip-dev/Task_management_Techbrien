/**
 * Database Seed Script (Prisma)
 * Creates minimal login user for initial access.
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Starting database seed...\n');

  const adminHash = await bcrypt.hash('Admin@123', 12);

  await prisma.user.upsert({
    where:  { email: 'admin@tmt.com' },
    update: { name: 'System Admin' },
    create: { name: 'System Admin', email: 'admin@tmt.com', password: adminHash, role: Role.ADMIN },
  });

  console.log('✅ Admin user ensured');
  console.log('\n🎉 Seed complete!\n');
  console.log('────────────────────────────────────────');
  console.log('  Admin:  admin@tmt.com / Admin@123');
  console.log('────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(()  => prisma.$disconnect());
