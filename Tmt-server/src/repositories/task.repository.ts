import { Pool } from 'pg';
import { Task, TaskStatus, TaskFilters, PaginationParams } from '../types';

export class TaskRepository {
  constructor(private readonly db: Pool) {}

  async findById(id: string): Promise<Task | null> {
    const { rows } = await this.db.query<any>(
      `SELECT id, title, description, status, project_id AS "projectId", assigned_to AS "assignedTo", due_date AS "dueDate", created_at AS "createdAt"
       FROM tasks WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByIdWithRelations(id: string): Promise<Task | null> {
    const { rows } = await this.db.query(
      `SELECT
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
       WHERE t.id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    return this.mapRow(rows[0]);
  }

  async create(data: {
    title:        string;
    description?: string;
    projectId:    string;
    assignedTo?:  string;
    dueDate?:     Date;
  }): Promise<Task> {
    const { rows } = await this.db.query<any>(
      `INSERT INTO tasks (title, description, project_id, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, status, project_id AS "projectId", assigned_to AS "assignedTo", due_date AS "dueDate", created_at AS "createdAt"`,
      [
        data.title,
        data.description ?? null,
        data.projectId,
        data.assignedTo  ?? null,
        data.dueDate     ?? null,
      ]
    );
    return rows[0];
  }

  async update(
    id: string,
    data: {
      title?:       string;
      description?: string;
      status?:      TaskStatus;
      assignedTo?:  string | null;
      dueDate?:     Date   | null;
    }
  ): Promise<Task> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(data.title); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }
    if (data.status      !== undefined) { fields.push(`status = $${idx++}`);      values.push(data.status); }
    if (data.assignedTo  !== undefined) { fields.push(`assigned_to = $${idx++}`); values.push(data.assignedTo); }
    if (data.dueDate     !== undefined) { fields.push(`due_date = $${idx++}`);    values.push(data.dueDate); }

    values.push(id);

    const { rows } = await this.db.query<any>(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, title, description, status, project_id AS "projectId", assigned_to AS "assignedTo", due_date AS "dueDate", created_at AS "createdAt"`,
      values
    );
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.query(`DELETE FROM tasks WHERE id = $1`, [id]);
  }

  async findMany(
    filters: TaskFilters,
    { limit, offset }: PaginationParams
  ): Promise<[Task[], number]> {
    // Build WHERE clause dynamically
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.projectId)  { conditions.push(`t.project_id  = $${idx++}`); values.push(filters.projectId); }
    if (filters.status)     { conditions.push(`t.status       = $${idx++}`); values.push(filters.status); }
    if (filters.assignedTo) { conditions.push(`t.assigned_to  = $${idx++}`); values.push(filters.assignedTo); }
    if (filters.title)      { conditions.push(`t.title ILIKE $${idx++}`); values.push(`%${filters.title}%`); }
    if (filters.description) { conditions.push(`t.description ILIKE $${idx++}`); values.push(`%${filters.description}%`); }
    if (filters.dueDate)    { conditions.push(`t.due_date::date = $${idx++}`); values.push(filters.dueDate); }

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
      ORDER BY t.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}`;

    const countQuery = `SELECT COUNT(*) FROM tasks t ${where}`;

    const [dataRes, countRes] = await Promise.all([
      this.db.query(dataQuery,  [...values, limit, offset]),
      this.db.query<{ count: string }>(countQuery, values),
    ]);

    return [
      dataRes.rows.map(this.mapRow),
      parseInt(countRes.rows[0].count, 10),
    ];
  }

  // ── Map flat SQL row → nested Task object ─────────────────────────────────
  private mapRow(row: any): Task {
    return {
      id:          row.id,
      title:       row.title,
      description: row.description,
      status:      row.status,
      projectId:   row.project_id,
      assignedTo:  row.assigned_to,
      dueDate:     row.due_date,
      createdAt:   row.created_at,
      project: { id: row.proj_id, name: row.proj_name },
      assignee: row.assignee_id
        ? { id: row.assignee_id, name: row.assignee_name, email: row.assignee_email }
        : null,
    };
  }
}
