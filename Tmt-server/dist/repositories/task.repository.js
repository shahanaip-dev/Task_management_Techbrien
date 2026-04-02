"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskRepository = void 0;
const pagination_1 = require("../utils/pagination");
class TaskRepository {
    constructor(db) {
        this.db = db;
    }
    async findById(id) {
        const { rows } = await this.db.query(`SELECT id, title, description, status, project_id AS "projectId", assigned_to AS "assignedTo", due_date AS "dueDate", created_at AS "createdAt"
       FROM tasks WHERE id = $1`, [id]);
        return rows[0] ?? null;
    }
    async findByIdWithRelations(id) {
        const { rows } = await this.db.query(`SELECT
         t.id, t.title, t.description, t.status,
         t.project_id, t.assigned_to, t.due_date, t.created_at,
         p.id    AS proj_id,
         p.name  AS proj_name,
         u.id    AS assignee_id,
         u.name  AS assignee_name,
         u.email AS assignee_email
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       LEFT JOIN users u ON u.id = t.assigned_to
       WHERE t.id = $1`, [id]);
        if (!rows[0])
            return null;
        return this.mapRow(rows[0]);
    }
    async create(data) {
        const { rows } = await this.db.query(`INSERT INTO tasks (title, description, project_id, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, status, project_id AS "projectId", assigned_to AS "assignedTo", due_date AS "dueDate", created_at AS "createdAt"`, [
            data.title,
            data.description ?? null,
            data.projectId,
            data.assignedTo ?? null,
            data.dueDate ?? null,
        ]);
        return rows[0];
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        let idx = 1;
        if (data.title !== undefined) {
            fields.push(`title = $${idx++}`);
            values.push(data.title);
        }
        if (data.description !== undefined) {
            fields.push(`description = $${idx++}`);
            values.push(data.description);
        }
        if (data.status !== undefined) {
            fields.push(`status = $${idx++}`);
            values.push(data.status);
        }
        if (data.assignedTo !== undefined) {
            fields.push(`assigned_to = $${idx++}`);
            values.push(data.assignedTo);
        }
        if (data.dueDate !== undefined) {
            fields.push(`due_date = $${idx++}`);
            values.push(data.dueDate);
        }
        values.push(id);
        const { rows } = await this.db.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, title, description, status, project_id AS "projectId", assigned_to AS "assignedTo", due_date AS "dueDate", created_at AS "createdAt"`, values);
        return rows[0];
    }
    async delete(id) {
        await this.db.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    }
    async findMany(filters, { limit, cursor }) {
        const conditions = [];
        const values = [];
        let idx = 1;
        if (filters.projectId) {
            conditions.push(`t.project_id  = $${idx++}`);
            values.push(filters.projectId);
        }
        if (filters.status) {
            conditions.push(`t.status       = $${idx++}`);
            values.push(filters.status);
        }
        if (filters.assignedTo) {
            conditions.push(`t.assigned_to  = $${idx++}`);
            values.push(filters.assignedTo);
        }
        if (filters.title) {
            conditions.push(`t.title ILIKE $${idx++}`);
            values.push(`%${filters.title}%`);
        }
        if (filters.description) {
            conditions.push(`t.description ILIKE $${idx++}`);
            values.push(`%${filters.description}%`);
        }
        if (filters.dueDate) {
            conditions.push(`t.due_date >= $${idx} AND t.due_date < ($${idx}::date + interval '1 day')`);
            values.push(filters.dueDate);
            idx += 1;
        }
        const decoded = (0, pagination_1.decodeCursor)(cursor);
        if (decoded) {
            conditions.push(`(t.created_at, t.id) < ($${idx++}, $${idx++})`);
            values.push(decoded.createdAt, decoded.id);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const dataQuery = `
      SELECT
        t.id, t.title, t.description, t.status,
        t.project_id, t.assigned_to, t.due_date, t.created_at,
        p.id    AS proj_id,
        p.name  AS proj_name,
        u.id    AS assignee_id,
        u.name  AS assignee_name,
        u.email AS assignee_email
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      LEFT JOIN users u ON u.id = t.assigned_to
      ${where}
      ORDER BY t.created_at DESC, t.id DESC
      LIMIT $${idx}`;
        const { rows } = await this.db.query(dataQuery, [...values, limit + 1]);
        const mapped = rows.map(this.mapRow);
        return (0, pagination_1.buildCursorResult)(mapped, limit, (row) => (0, pagination_1.encodeCursor)(row.createdAt, row.id));
    }
    mapRow(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            status: row.status,
            projectId: row.project_id,
            assignedTo: row.assigned_to,
            dueDate: row.due_date,
            createdAt: row.created_at,
            project: { id: row.proj_id, name: row.proj_name },
            assignee: row.assignee_id
                ? { id: row.assignee_id, name: row.assignee_name, email: row.assignee_email }
                : null,
        };
    }
}
exports.TaskRepository = TaskRepository;
//# sourceMappingURL=task.repository.js.map