"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
function toStatusCounts(rows) {
    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    for (const row of rows) {
        counts[row.status] = parseInt(row.count, 10);
    }
    return counts;
}
class DashboardService {
    constructor(db) {
        this.db = db;
    }
    async getSummary(user) {
        if (user.role === 'ADMIN') {
            const [statusRows, projectCount, userCount, projectTaskRows] = await Promise.all([
                this.db.query(`SELECT status, COUNT(*)::text AS count FROM tasks GROUP BY status`),
                this.db.query(`SELECT COUNT(*)::text AS count FROM projects`),
                this.db.query(`SELECT COUNT(*)::text AS count FROM users WHERE role != 'ADMIN'`),
                this.db.query(`SELECT p.name, COUNT(t.id)::int AS value
           FROM projects p
           LEFT JOIN tasks t ON t.project_id = p.id
           GROUP BY p.id
           ORDER BY p.created_at DESC`),
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
            this.db.query(`SELECT status, COUNT(*)::text AS count
         FROM tasks
         WHERE assigned_to = $1
         GROUP BY status`, [user.id]),
            this.db.query(`SELECT COUNT(DISTINCT p.id)::text AS count
         FROM projects p
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1`, [user.id]),
            this.db.query(`SELECT p.name, COUNT(t.id)::int AS value
         FROM projects p
         JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
         LEFT JOIN tasks t ON t.project_id = p.id AND t.assigned_to = $1
         GROUP BY p.id
         ORDER BY p.created_at DESC`, [user.id]),
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
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map