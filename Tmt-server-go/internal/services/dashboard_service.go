package services

import (
	"context"

	"tmt-server-go/internal/types"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DashboardService struct {
	db *pgxpool.Pool
}

func NewDashboardService(db *pgxpool.Pool) *DashboardService {
	return &DashboardService{db: db}
}

func (s *DashboardService) Summary(ctx context.Context, user types.JwtUser) (types.DashboardSummary, error) {
	if user.Role == types.RoleAdmin {
		statusCounts, err := s.statusCountsAll(ctx)
		if err != nil {
			return types.DashboardSummary{}, err
		}

		projects, err := s.countProjects(ctx)
		if err != nil {
			return types.DashboardSummary{}, err
		}

		teamMembers, err := s.countTeamMembers(ctx)
		if err != nil {
			return types.DashboardSummary{}, err
		}

		projectTaskCounts, err := s.projectTaskCountsAll(ctx)
		if err != nil {
			return types.DashboardSummary{}, err
		}

		tasksTotal := statusCounts.Todo + statusCounts.InProgress + statusCounts.Done

		return types.DashboardSummary{
			Totals: types.DashboardTotals{
				Tasks:           tasksTotal,
				Projects:        projects,
				TasksDone:       statusCounts.Done,
				TasksInProgress: statusCounts.InProgress,
				TeamMembers:     &teamMembers,
			},
			StatusCounts:      statusCounts,
			ProjectTaskCounts: projectTaskCounts,
		}, nil
	}

	statusCounts, err := s.statusCountsForUser(ctx, user.ID)
	if err != nil {
		return types.DashboardSummary{}, err
	}

	projects, err := s.countProjectsForUser(ctx, user.ID)
	if err != nil {
		return types.DashboardSummary{}, err
	}

	projectTaskCounts, err := s.projectTaskCountsForUser(ctx, user.ID)
	if err != nil {
		return types.DashboardSummary{}, err
	}

	tasksTotal := statusCounts.Todo + statusCounts.InProgress + statusCounts.Done

	return types.DashboardSummary{
		Totals: types.DashboardTotals{
			Tasks:           tasksTotal,
			Projects:        projects,
			TasksDone:       statusCounts.Done,
			TasksInProgress: statusCounts.InProgress,
		},
		StatusCounts:      statusCounts,
		ProjectTaskCounts: projectTaskCounts,
	}, nil
}

func (s *DashboardService) statusCountsAll(ctx context.Context) (types.StatusCounts, error) {
	const q = `SELECT status, COUNT(*)::int AS count FROM tasks GROUP BY status`
	rows, err := s.db.Query(ctx, q)
	if err != nil {
		return types.StatusCounts{}, err
	}
	defer rows.Close()

	return scanStatusCounts(rows)
}

func (s *DashboardService) statusCountsForUser(ctx context.Context, userID string) (types.StatusCounts, error) {
	const q = `SELECT status, COUNT(*)::int AS count
	FROM tasks
	WHERE assigned_to = $1
	GROUP BY status`
	rows, err := s.db.Query(ctx, q, userID)
	if err != nil {
		return types.StatusCounts{}, err
	}
	defer rows.Close()

	return scanStatusCounts(rows)
}

func scanStatusCounts(rows pgxRows) (types.StatusCounts, error) {
	counts := types.StatusCounts{}
	for rows.Next() {
		var status types.TaskStatus
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return types.StatusCounts{}, err
		}
		switch status {
		case types.TaskTodo:
			counts.Todo = count
		case types.TaskInProgress:
			counts.InProgress = count
		case types.TaskDone:
			counts.Done = count
		}
	}
	if err := rows.Err(); err != nil {
		return types.StatusCounts{}, err
	}
	return counts, nil
}

func (s *DashboardService) countProjects(ctx context.Context) (int, error) {
	const q = `SELECT COUNT(*)::int AS count FROM projects`
	var count int
	if err := s.db.QueryRow(ctx, q).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (s *DashboardService) countTeamMembers(ctx context.Context) (int, error) {
	const q = `SELECT COUNT(*)::int AS count FROM users WHERE role != 'ADMIN'`
	var count int
	if err := s.db.QueryRow(ctx, q).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (s *DashboardService) countProjectsForUser(ctx context.Context, userID string) (int, error) {
	const q = `SELECT COUNT(DISTINCT p.id)::int AS count
	FROM projects p
	JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1`
	var count int
	if err := s.db.QueryRow(ctx, q, userID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (s *DashboardService) projectTaskCountsAll(ctx context.Context) ([]types.ProjectTaskCount, error) {
	const q = `SELECT p.name, COUNT(t.id)::int AS value
	FROM projects p
	LEFT JOIN tasks t ON t.project_id = p.id
	GROUP BY p.id
	ORDER BY p.created_at DESC`
	rows, err := s.db.Query(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanProjectTaskCounts(rows)
}

func (s *DashboardService) projectTaskCountsForUser(ctx context.Context, userID string) ([]types.ProjectTaskCount, error) {
	const q = `SELECT p.name, COUNT(t.id)::int AS value
	FROM projects p
	JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
	LEFT JOIN tasks t ON t.project_id = p.id AND t.assigned_to = $1
	GROUP BY p.id
	ORDER BY p.created_at DESC`
	rows, err := s.db.Query(ctx, q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanProjectTaskCounts(rows)
}

func scanProjectTaskCounts(rows pgxRows) ([]types.ProjectTaskCount, error) {
	var out []types.ProjectTaskCount
	for rows.Next() {
		var name string
		var value int
		if err := rows.Scan(&name, &value); err != nil {
			return nil, err
		}
		if value > 0 {
			out = append(out, types.ProjectTaskCount{Name: name, Value: value})
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

type pgxRows interface {
	Next() bool
	Scan(...any) error
	Err() error
}
