"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Migration runner — idempotent, splits statements individually.
 * Run: npm run db:migrate
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
async function migrate() {
    console.log('\n🔄 Running database migration...\n');
    const schemaPath = path_1.default.join(__dirname, 'schema.sql');
    const sql = fs_1.default.readFileSync(schemaPath, 'utf-8');
    // Split on semicolons (skip empty chunks) and run each statement individually
    const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    let errors = 0;
    for (const stmt of statements) {
        try {
            await index_1.db.query(stmt);
        }
        catch (err) {
            // 42710 = duplicate_object (enum), 42P07 = duplicate_table, 42701 = duplicate_column
            if (['42710', '42P07', '42701'].includes(err.code)) {
                // silently skip — already exists
            }
            else {
                console.error('❌ Statement failed:', err.message, '\n  SQL:', stmt.substring(0, 80));
                errors++;
            }
        }
    }
    if (errors === 0) {
        console.log('✅ Migration complete — all statements applied\n');
    }
    else {
        console.log(`⚠️  Migration finished with ${errors} error(s)\n`);
    }
    await index_1.db.end();
}
migrate();
//# sourceMappingURL=migrate.js.map