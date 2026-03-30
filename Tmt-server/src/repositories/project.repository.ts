import { Pool } from 'pg';
import { Project, PaginationParams } from '../types';

export class ProjectRepository {
  constructor(private readonly db: Pool) {}

  async findById(id: string): Promise<Project | null> {
    const { rows } = await this.db.query<Project>(
      `SELECT id, name, description, created_by, created_at FROM projects WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  }

  async findByIdWithCreator(id: string): Promise<Project | null> {
    const { rows } = await this.db.query(
      `SELECT
         p.id, p.name, p.description, p.created_by, p.created_at,
         u.id   AS creator_id,
         u.name AS creator_name,
         u.email AS creator_email
       FROM projects p
       JOIN users u ON u.id = p.created_by
       WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id:          row.id,
      name:        row.name,
      description: row.description,
      created_by:  row.created_by,
      created_at:  row.created_at,
      creator: {
        id:    row.creator_id,
        name:  row.creator_name,
        email: row.creator_email,
      },
    };
  }

  async create(data: {
    name:        string;
    description?: string;
    createdBy:   string;
    memberIds?:  string[];
  }): Promise<Project> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query<Project>(
        `INSERT INTO projects (name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING id, name, description, created_by, created_at`,
        [data.name, data.description ?? null, data.createdBy]
      );
      const project = rows[0];

      const memberIds = Array.from(new Set([data.createdBy, ...(data.memberIds ?? [])]));
      if (memberIds.length) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id)
           SELECT $1, unnest($2::uuid[])
           ON CONFLICT DO NOTHING`,
          [project.id, memberIds]
        );
      }

      await client.query('COMMIT');
      return project;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Project> {
    // Build SET clause dynamically from provided fields only
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name        !== undefined) { fields.push(`name = $${idx++}`);        values.push(data.name); }
    if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }

    values.push(id); // last param for WHERE clause

    const { rows } = await this.db.query<Project>(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, name, description, created_by, created_at`,
      values
    );
    return rows[0];
  }

  async delete(id: string): Promise<void> {
    // Tasks are CASCADE deleted by FK constraint
    await this.db.query(`DELETE FROM projects WHERE id = $1`, [id]);
  }

  async findMany({ limit, offset }: PaginationParams): Promise<[Project[], number]> {
    const [dataRes, countRes] = await Promise.all([
      this.db.query(
        `SELECT
           p.id, p.name, p.description, p.created_by, p.created_at,
           u.id    AS creator_id,
           u.name  AS creator_name,
           u.email AS creator_email,
           (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id)::int AS task_count
         FROM projects p
         JOIN users u ON u.id = p.created_by
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      this.db.query<{ count: string }>(`SELECT COUNT(*) FROM projects`),
    ]);

    const projects: Project[] = dataRes.rows.map((row) => ({
      id:          row.id,
      name:        row.name,
      description: row.description,
      created_by:  row.created_by,
      created_at:  row.created_at,
      task_count:  row.task_count,
      creator: {
        id:    row.creator_id,
        name:  row.creator_name,
        email: row.creator_email,
      },
    }));

    return [projects, parseInt(countRes.rows[0].count, 10)];
  }

  async findManyForUser(userId: string, { limit, offset }: PaginationParams): Promise<[Project[], number]> {
    const [dataRes, countRes] = await Promise.all([
      this.db.query(
        `SELECT
           p.id, p.name, p.description, p.created_by, p.created_at,
           u.id    AS creator_id,
           u.name  AS creator_name,
           u.email AS creator_email,
           (SELECT COUNT(*) FROM tasks t2
            WHERE t2.project_id = p.id AND t2.assigned_to = $3)::int AS task_count
         FROM projects p
         JOIN users u ON u.id = p.created_by
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $3
         GROUP BY p.id, u.id
         ORDER BY p.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset, userId]
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(DISTINCT p.id)
         FROM projects p
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1`,
        [userId]
      ),
    ]);

    const projects: Project[] = dataRes.rows.map((row) => ({
      id:          row.id,
      name:        row.name,
      description: row.description,
      created_by:  row.created_by,
      created_at:  row.created_at,
      task_count:  row.task_count,
      creator: {
        id:    row.creator_id,
        name:  row.creator_name,
        email: row.creator_email,
      },
    }));

    return [projects, parseInt(countRes.rows[0].count, 10)];
  }

  async findByIdWithCreatorForUser(id: string, userId: string): Promise<Project | null> {
    const { rows } = await this.db.query(
      `SELECT
         p.id, p.name, p.description, p.created_by, p.created_at,
         u.id   AS creator_id,
         u.name AS creator_name,
         u.email AS creator_email,
         (SELECT COUNT(*) FROM tasks t2
          WHERE t2.project_id = p.id AND t2.assigned_to = $2)::int AS task_count
       FROM projects p
       JOIN users u ON u.id = p.created_by
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
       WHERE p.id = $1
       GROUP BY p.id, u.id`,
      [id, userId]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id:          row.id,
      name:        row.name,
      description: row.description,
      created_by:  row.created_by,
      created_at:  row.created_at,
      task_count:  row.task_count,
      creator: {
        id:    row.creator_id,
        name:  row.creator_name,
        email: row.creator_email,
      },
    };
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM project_members
         WHERE project_id = $1 AND user_id = $2
       ) AS exists`,
      [projectId, userId]
    );
    return !!rows[0]?.exists;
  }
}
