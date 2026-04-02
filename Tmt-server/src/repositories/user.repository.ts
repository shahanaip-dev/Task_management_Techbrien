import { Pool } from 'pg';
import { User, Role, CursorParams, CursorResult } from '../types';
import { buildCursorResult, decodeCursor, encodeCursor } from '../utils/pagination';

// Never return password in list/create responses
const PUBLIC_COLS = 'id, name, email, role, created_at AS "createdAt"';

export class UserRepository {
  constructor(private readonly db: Pool) {}

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.db.query<User>(
      `SELECT id, name, email, password, role, created_at AS "createdAt" FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findPublicById(id: string): Promise<Omit<User, 'password'> | null> {
    const { rows } = await this.db.query<Omit<User, 'password'>>(
      `SELECT ${PUBLIC_COLS} FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.db.query<User>(
      `SELECT id, name, email, password, role, created_at AS "createdAt" FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return rows[0] ?? null;
  }

  async findIdByEmail(email: string): Promise<string | null> {
    const { rows } = await this.db.query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return rows[0]?.id ?? null;
  }

  async create(data: {
    name:     string;
    email:    string;
    password: string;
    role:     Role;
  }): Promise<Omit<User, 'password'>> {
    const { rows } = await this.db.query<Omit<User, 'password'>>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${PUBLIC_COLS}`,
      [data.name, data.email.toLowerCase().trim(), data.password, data.role]
    );
    return rows[0];
  }

  async update(id: string, data: {
    name?:     string;
    email?:    string;
    password?: string;
    role?:     Role;
  }): Promise<Omit<User, 'password'>> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name     !== undefined) { fields.push(`name = $${idx++}`);     values.push(data.name); }
    if (data.email    !== undefined) { fields.push(`email = $${idx++}`);    values.push(data.email); }
    if (data.password !== undefined) { fields.push(`password = $${idx++}`); values.push(data.password); }
    if (data.role     !== undefined) { fields.push(`role = $${idx++}`);     values.push(data.role); }

    values.push(id);

    const { rows } = await this.db.query<Omit<User, 'password'>>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING ${PUBLIC_COLS}`,
      values
    );
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM users WHERE id = $1`, [id]);
  }

  async findMany({ limit, cursor }: CursorParams): Promise<CursorResult<Omit<User, 'password'>>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const decoded = decodeCursor(cursor);
    if (decoded) {
      conditions.push(`(created_at, id) < ($${idx++}, $${idx++})`);
      values.push(decoded.createdAt, decoded.id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await this.db.query<Omit<User, 'password'>>(
      `SELECT ${PUBLIC_COLS}
       FROM users
       ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${idx}`,
      [...values, limit + 1]
    );

    return buildCursorResult(rows, limit, (row) => encodeCursor(row.createdAt, row.id));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const { rows } = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );
    return parseInt(rows[0].count, 10) > 0;
  }
}