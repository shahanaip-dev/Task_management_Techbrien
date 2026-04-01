"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
// Never return password in list/create responses
const PUBLIC_COLS = 'id, name, email, role, created_at AS "createdAt"';
class UserRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const { rows } = await this.db.query(`SELECT id, name, email, password, role, created_at AS "createdAt" FROM users WHERE id = $1`, [id]);
        return rows[0] ?? null;
    }
    async findPublicById(id) {
        const { rows } = await this.db.query(`SELECT ${PUBLIC_COLS} FROM users WHERE id = $1`, [id]);
        return rows[0] ?? null;
    }
    async findByEmail(email) {
        const { rows } = await this.db.query(`SELECT id, name, email, password, role, created_at AS "createdAt" FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
        return rows[0] ?? null;
    }
    async findIdByEmail(email) {
        const { rows } = await this.db.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
        return rows[0]?.id ?? null;
    }
    async create(data) {
        const { rows } = await this.db.query(`INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${PUBLIC_COLS}`, [data.name, data.email.toLowerCase().trim(), data.password, data.role]);
        return rows[0];
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let idx = 1;
        if (data.name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(data.name);
        }
        if (data.email !== undefined) {
            fields.push(`email = $${idx++}`);
            values.push(data.email);
        }
        if (data.password !== undefined) {
            fields.push(`password = $${idx++}`);
            values.push(data.password);
        }
        if (data.role !== undefined) {
            fields.push(`role = $${idx++}`);
            values.push(data.role);
        }
        values.push(id);
        const { rows } = await this.db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING ${PUBLIC_COLS}`, values);
        return rows[0];
    }
    async delete(id) {
        await this.db.query(`DELETE FROM users WHERE id = $1`, [id]);
    }
    async findMany({ limit, offset }) {
        const [dataRes, countRes] = await Promise.all([
            this.db.query(`SELECT ${PUBLIC_COLS} FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
            this.db.query(`SELECT COUNT(*) FROM users`),
        ]);
        return [dataRes.rows, parseInt(countRes.rows[0].count, 10)];
    }
    async existsByEmail(email) {
        const { rows } = await this.db.query(`SELECT COUNT(*) FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
        return parseInt(rows[0].count, 10) > 0;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map