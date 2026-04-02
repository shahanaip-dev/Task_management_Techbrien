import { Pool } from 'pg';
import { JwtUser, TaskStatus } from '../types';

interface StatusCounts {
  TODO: number;
  IN_PROGRESS: number;
  DONE: number;
}

function toStatusCounts(rows: Array<{ status: TaskStatus; count: string }>): StatusCounts {
  const counts: StatusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
  for (const row of rows) {
    counts[row.status] = parseInt(row.count, 10);
  }
  return counts;
}

export class DashboardService {
  constructor(private readonly db: Pool) {}

  async getSummary(user: JwtUser) {
    if (user.role === 'ADMIN') {
      const [statusRows, projectCount, userCount, projectTaskRows] = await Promise.all([
        this.db.query<{ status: TaskStatus; count: string }>(
          `SELECT status, COUNT(*)::text AS count FROM tasks GROUP BY status`
        ),
        this.db.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM projects`),
        this.db.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM users WHERE role != 'ADMIN'`),
        this.db.query<{ name: string; value: number }>(
          `SELECT p.name, COUNT(t.id)::int AS value
           FROM projects p
           LEFT JOIN tasks t ON t.project_id = p.id
           GROUP BY p.id
           ORDER BY p.created_at DESC`
        ),
      ]);

      const statusCounts = toStatusCounts(statusRows.rows);

      return {
        totals: {
          tasks: statusCounts.TODO + statusCounts.IN_PROGRESS + statusCounts.DONE,
          projects: parseInt(projectCount.rows[0].count, 10),
          tasksDone: statusCounts.DONE,
          tasksInProgress: statusCounts.IN_PROGRESS,
          teamMembers: parseInt(userCount.rows[0].count, 10),
        },
        statusCounts,
        projectTaskCounts: projectTaskRows.rows.filter((r) => r.value > 0),
      };
    }

    const [statusRows, projectCount, projectTaskRows] = await Promise.all([
      this.db.query<{ status: TaskStatus; count: string }>(
        `SELECT status, COUNT(*)::text AS count
         FROM tasks
         WHERE assigned_to = $1
         GROUP BY status`,
        [user.id]
      ),
      this.db.query<{ count: string }>(
        `SELECT COUNT(DISTINCT p.id)::text AS count
         FROM projects p
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1`,
        [user.id]
      ),
      this.db.query<{ name: string; value: number }>(
        `SELECT p.name, COUNT(t.id)::int AS value
         FROM projects p
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
         LEFT JOIN tasks t ON t.project_id = p.id AND t.assigned_to = $1
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [user.id]
      ),
    ]);

    const statusCounts = toStatusCounts(statusRows.rows);

    return {
      totals: {
        tasks: statusCounts.TODO + statusCounts.IN_PROGRESS + statusCounts.DONE,
        projects: parseInt(projectCount.rows[0].count, 10),
        tasksDone: statusCounts.DONE,
        tasksInProgress: statusCounts.IN_PROGRESS,
      },
      statusCounts,
      projectTaskCounts: projectTaskRows.rows.filter((r) => r.value > 0),
    };
  }
}