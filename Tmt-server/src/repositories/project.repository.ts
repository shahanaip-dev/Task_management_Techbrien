import { Pool } from 'pg';
import { Project, CursorParams, CursorResult } from '../types';
import { buildCursorResult, decodeCursor, encodeCursor } from '../utils/pagination';

export class ProjectRepository {
  constructor(private readonly db: Pool) {}

  async findById(id: string): Promise<Project | null> {
    const { rows } = await this.db.query<any>(
      `SELECT id, name, description, created_by AS "createdBy", created_at AS "createdAt" FROM projects WHERE id = $1`,
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
         u.email AS creator_email,
         COALESCE(tc.task_count, 0) AS task_count,
         ARRAY(
           SELECT pm.user_id::text FROM project_members pm WHERE pm.project_id = p.id
         ) AS member_ids
       FROM projects p
       JOIN users u ON u.id = p.created_by
       LEFT JOIN (
         SELECT project_id, COUNT(*)::int AS task_count
         FROM tasks
         GROUP BY project_id
       ) tc ON tc.project_id = p.id
       WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id:          row.id,
      name:        row.name,
      description: row.description,
      createdBy:   row.created_by,
      createdAt:   row.created_at,
      taskCount:   row.task_count,
      memberIds:   row.member_ids ?? [],
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
      const { rows } = await client.query<any>(
        `INSERT INTO projects (name, description, created_by)
         VALUES ($1, $2, $3)
         RETURNING id, name, description, created_by AS "createdBy", created_at AS "createdAt"`,
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

  async update(id: string, data: { name?: string; description?: string; memberIds?: string[] }): Promise<Project> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Build SET clause dynamically from provided fields only
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (data.name        !== undefined) { fields.push(`name = $${idx++}`);        values.push(data.name); }
      if (data.description !== undefined) { fields.push(`description = $${idx++}`); values.push(data.description); }

      let project: Project;
      if (fields.length > 0) {
        values.push(id);
        const { rows } = await client.query<any>(
          `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx}
           RETURNING id, name, description, created_by AS "createdBy", created_at AS "createdAt"`,
          values
        );
        project = rows[0];
      } else {
        const { rows } = await client.query<any>(
          `SELECT id, name, description, created_by AS "createdBy", created_at AS "createdAt" FROM projects WHERE id = $1`,
          [id]
        );
        project = rows[0];
      }

      // Update members if memberIds provided
      if (data.memberIds !== undefined) {
        await client.query(`DELETE FROM project_members WHERE project_id = $1`, [id]);
        // Always keep the project creator as a member
        const { rows: creatorRows } = await client.query<{ created_by: string }>(
          `SELECT created_by FROM projects WHERE id = $1`, [id]
        );
        const creatorId = creatorRows[0]?.created_by;
        const memberIds = Array.from(new Set([...(creatorId ? [creatorId] : []), ...data.memberIds]));
        if (memberIds.length > 0) {
          await client.query(
            `INSERT INTO project_members (project_id, user_id)
             SELECT $1, unnest($2::uuid[])
             ON CONFLICT DO NOTHING`,
            [id, memberIds]
          );
        }
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

  async delete(id: string): Promise<void> {
    // Tasks are CASCADE deleted by FK constraint
    await this.db.query(`DELETE FROM projects WHERE id = $1`, [id]);
  }

  async findMany({ limit, cursor }: CursorParams, name?: string): Promise<CursorResult<Project>> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (name) {
      conditions.push(`p.name ILIKE $${idx++}`);
      values.push(`%${name}%`);
    }

    const decoded = decodeCursor(cursor);
    if (decoded) {
      conditions.push(`(p.created_at, p.id) < ($${idx++}, $${idx++})`);
      values.push(decoded.createdAt, decoded.id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await this.db.query(
      `SELECT
         p.id, p.name, p.description, p.created_by, p.created_at,
         u.id    AS creator_id,
         u.name  AS creator_name,
         u.email AS creator_email,
         COALESCE(tc.task_count, 0) AS task_count,
         ARRAY(
           SELECT pm.user_id::text FROM project_members pm WHERE pm.project_id = p.id
         ) AS member_ids
       FROM projects p
       JOIN users u ON u.id = p.created_by
       LEFT JOIN (
         SELECT project_id, COUNT(*)::int AS task_count
         FROM tasks
         GROUP BY project_id
       ) tc ON tc.project_id = p.id
       ${where}
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT $${idx}`,
      [...values, limit + 1]
    );

    const projects: Project[] = rows.map((row: any) => ({
      id:          row.id,
      name:        row.name,
      description: row.description,
      createdBy:   row.created_by,
      createdAt:   row.created_at,
      taskCount:   row.task_count,
      memberIds:   row.member_ids ?? [],
      creator: {
        id:    row.creator_id,
        name:  row.creator_name,
        email: row.creator_email,
      },
    }));

    return buildCursorResult(projects, limit, (row) => encodeCursor(row.createdAt, row.id));
  }

  async findManyForUser(userId: string, { limit, cursor }: CursorParams, name?: string): Promise<CursorResult<Project>> {
    const conditions: string[] = [];
    const values: unknown[] = [userId];
    let idx = 2;

    if (name) {
      conditions.push(`p.name ILIKE $${idx++}`);
      values.push(`%${name}%`);
    }

    const decoded = decodeCursor(cursor);
    if (decoded) {
      conditions.push(`(p.created_at, p.id) < ($${idx++}, $${idx++})`);
      values.push(decoded.createdAt, decoded.id);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await this.db.query(
      `SELECT
         p.id, p.name, p.description, p.created_by, p.created_at,
         u.id    AS creator_id,
         u.name  AS creator_name,
         u.email AS creator_email,
         COALESCE(tc.task_count, 0) AS task_count,
         ARRAY(
           SELECT pm2.user_id::text FROM project_members pm2 WHERE pm2.project_id = p.id
         ) AS member_ids
       FROM projects p
       JOIN users u ON u.id = p.created_by
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
       LEFT JOIN (
         SELECT project_id, assigned_to, COUNT(*)::int AS task_count
         FROM tasks
         GROUP BY project_id, assigned_to
       ) tc ON tc.project_id = p.id AND tc.assigned_to = $1
       ${where}
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT $${idx}`,
      [...values, limit + 1]
    );

    const projects: Project[] = rows.map((row: any) => ({
      id:          row.id,
      name:        row.name,
      description: row.description,
      createdBy:   row.created_by,
      createdAt:   row.created_at,
      taskCount:   row.task_count,
      memberIds:   row.member_ids ?? [],
      creator: {
        id:    row.creator_id,
        name:  row.creator_name,
        email: row.creator_email,
      },
    }));

    return buildCursorResult(projects, limit, (row) => encodeCursor(row.createdAt, row.id));
  }

  async findByIdWithCreatorForUser(id: string, userId: string): Promise<Project | null> {
    const { rows } = await this.db.query(
      `SELECT
         p.id, p.name, p.description, p.created_by, p.created_at,
         u.id   AS creator_id,
         u.name AS creator_name,
         u.email AS creator_email,
         COALESCE(tc.task_count, 0) AS task_count,
         ARRAY(
           SELECT pm2.user_id::text FROM project_members pm2 WHERE pm2.project_id = p.id
         ) AS member_ids
       FROM projects p
       JOIN users u ON u.id = p.created_by
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
       LEFT JOIN (
         SELECT project_id, assigned_to, COUNT(*)::int AS task_count
         FROM tasks
         GROUP BY project_id, assigned_to
       ) tc ON tc.project_id = p.id AND tc.assigned_to = $2
       WHERE p.id = $1
       GROUP BY p.id, u.id, tc.task_count`,
      [id, userId]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id:          row.id,
      name:        row.name,
      description: row.description,
      createdBy:   row.created_by,
      createdAt:   row.created_at,
      taskCount:   row.task_count,
      memberIds:   row.member_ids ?? [],
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
