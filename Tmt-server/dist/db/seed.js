"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Database Seed Script
 * Run: npm run db:seed
 * Creates minimal login user for initial access.
 */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("./index");
async function seed() {
    console.log('\n🌱 Seeding database...\n');
    // ── Users ─────────────────────────────────────────────────────────────────────────
    const adminHash = await bcryptjs_1.default.hash('Admin@123', 12);
    await index_1.db.query(`INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name`, ['System Admin', 'admin@tmt.com', adminHash, 'ADMIN']);
    console.log('✅ Admin user ensured');
    console.log('\n🎉 Seed complete!\n');
    console.log('────────────────────────────────────────');
    console.log('  Admin:  admin@tmt.com  / Admin@123');
    console.log('────────────────────────────────────────\n');
    await index_1.db.end();
}
seed().catch((err) => { console.error(err); process.exit(1); });
//# sourceMappingURL=seed.js.map