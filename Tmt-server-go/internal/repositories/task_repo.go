package repositories

import (
	"context"
	"errors"
	"strconv"
	"strings"
	"time"

	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/types"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TaskRepository struct {
	db *pgxpool.Pool
}

func NewTaskRepository(db *pgxpool.Pool) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) FindByID(ctx context.Context, id string) (*types.Task, error) {
	const q = `SELECT id, title, description, status, project_id, assigned_to, due_date, created_at
	FROM tasks WHERE id = $1`
	row := r.db.QueryRow(ctx, q, id)

	var t types.Task
	if err := row.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.ProjectID, &t.AssignedTo, &t.DueDate, &t.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &t, nil
}

func (r *TaskRepository) FindByIDWithRelations(ctx context.Context, id string) (*types.Task, error) {
	const q = `SELECT
		t.id, t.title, t.description, t.status,
		t.project_id, t.assigned_to, t.due_date, t.created_at,
		p.id AS proj_id, p.name AS proj_name,
		u.id AS assignee_id, u.name AS assignee_name, u.email AS assignee_email
	FROM tasks t
	JOIN projects p ON p.id = t.project_id
	LEFT JOIN users u ON u.id = t.assigned_to
	WHERE t.id = $1`

	row := r.db.QueryRow(ctx, q, id)

	var t types.Task
	var proj types.ProjectBrief
	var assigneeID *string
	var assigneeName *string
	var assigneeEmail *string
	if err := row.Scan(
		&t.ID, &t.Title, &t.Description, &t.Status,
		&t.ProjectID, &t.AssignedTo, &t.DueDate, &t.CreatedAt,
		&proj.ID, &proj.Name,
		&assigneeID, &assigneeName, &assigneeEmail,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	t.Project = &proj
	if assigneeID != nil {
		t.Assignee = &types.UserBrief{ID: *assigneeID, Name: derefString(assigneeName), Email: derefString(assigneeEmail)}
	}
	return &t, nil
}

func (r *TaskRepository) Create(ctx context.Context, data struct {
	Title       string
	Description *string
	ProjectID   string
	AssignedTo  *string
	DueDate     *time.Time
}) (types.Task, error) {
	const q = `INSERT INTO tasks (title, description, project_id, assigned_to, due_date)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id, title, description, status, project_id, assigned_to, due_date, created_at`

	row := r.db.QueryRow(ctx, q, data.Title, data.Description, data.ProjectID, data.AssignedTo, data.DueDate)
	var t types.Task
	if err := row.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.ProjectID, &t.AssignedTo, &t.DueDate, &t.CreatedAt); err != nil {
		return types.Task{}, err
	}
	return t, nil
}

func (r *TaskRepository) Update(ctx context.Context, id string, data struct {
	Title       *string
	Description *string
	Status      *types.TaskStatus
	AssignedTo  *string
	DueDate     **time.Time
}) (types.Task, error) {
	fields := []string{}
	values := []any{}
	idx := 1

	if data.Title != nil {
		fields = append(fields, "title = $"+strconv.Itoa(idx))
		values = append(values, *data.Title)
		idx++
	}
	if data.Description != nil {
		fields = append(fields, "description = $"+strconv.Itoa(idx))
		values = append(values, *data.Description)
		idx++
	}
	if data.Status != nil {
		fields = append(fields, "status = $"+strconv.Itoa(idx))
		values = append(values, *data.Status)
		idx++
	}
	if data.AssignedTo != nil {
		fields = append(fields, "assigned_to = $"+strconv.Itoa(idx))
		values = append(values, *data.AssignedTo)
		idx++
	}
	if data.DueDate != nil {
		fields = append(fields, "due_date = $"+strconv.Itoa(idx))
		values = append(values, *data.DueDate)
		idx++
	}

	values = append(values, id)
	q := `UPDATE tasks SET ` + strings.Join(fields, ", ") + ` WHERE id = $` + strconv.Itoa(idx) +
		` RETURNING id, title, description, status, project_id, assigned_to, due_date, created_at`

	row := r.db.QueryRow(ctx, q, values...)
	var t types.Task
	if err := row.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.ProjectID, &t.AssignedTo, &t.DueDate, &t.CreatedAt); err != nil {
		return types.Task{}, err
	}
	return t, nil
}

func (r *TaskRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM tasks WHERE id = $1`, id)
	return err
}

func (r *TaskRepository) FindMany(ctx context.Context, filters types.TaskFilters, params pagination.CursorParams) (types.CursorResult[types.Task], error) {
	conditions := []string{}
	values := []any{}
	idx := 1

	if filters.ProjectID != "" {
		conditions = append(conditions, "t.project_id = $"+strconv.Itoa(idx))
		values = append(values, filters.ProjectID)
		idx++
	}
	if filters.Status != "" {
		conditions = append(conditions, "t.status = $"+strconv.Itoa(idx))
		values = append(values, filters.Status)
		idx++
	}
	if filters.AssignedTo != "" {
		conditions = append(conditions, "t.assigned_to = $"+strconv.Itoa(idx))
		values = append(values, filters.AssignedTo)
		idx++
	}
	if filters.Title != "" {
		conditions = append(conditions, "t.title ILIKE $"+strconv.Itoa(idx))
		values = append(values, "%"+filters.Title+"%")
		idx++
	}
	if filters.Description != "" {
		conditions = append(conditions, "t.description ILIKE $"+strconv.Itoa(idx))
		values = append(values, "%"+filters.Description+"%")
		idx++
	}
	if filters.DueDate != "" {
		conditions = append(conditions, "t.due_date >= $"+strconv.Itoa(idx)+" AND t.due_date < ($"+strconv.Itoa(idx)+"::date + interval '1 day')")
		values = append(values, filters.DueDate)
		idx++
	}

	if createdAt, cid, ok := pagination.DecodeCursor(params.Cursor); ok {
		conditions = append(conditions, "(t.created_at, t.id) < ($"+strconv.Itoa(idx)+", $"+strconv.Itoa(idx+1)+")")
		values = append(values, createdAt, cid)
		idx += 2
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	q := `SELECT
		t.id, t.title, t.description, t.status,
		t.project_id, t.assigned_to, t.due_date, t.created_at,
		p.id AS proj_id, p.name AS proj_name,
		u.id AS assignee_id, u.name AS assignee_name, u.email AS assignee_email
	FROM tasks t
	JOIN projects p ON p.id = t.project_id
	LEFT JOIN users u ON u.id = t.assigned_to
	` + where + `
	ORDER BY t.created_at DESC, t.id DESC
	LIMIT $` + strconv.Itoa(idx)

	rows, err := r.db.Query(ctx, q, append(values, params.Limit+1)...)
	if err != nil {
		return types.CursorResult[types.Task]{}, err
	}
	defer rows.Close()

	var tasks []types.Task
	for rows.Next() {
		var t types.Task
		var proj types.ProjectBrief
		var assigneeID *string
		var assigneeName *string
		var assigneeEmail *string
		if err := rows.Scan(
			&t.ID, &t.Title, &t.Description, &t.Status,
			&t.ProjectID, &t.AssignedTo, &t.DueDate, &t.CreatedAt,
			&proj.ID, &proj.Name,
			&assigneeID, &assigneeName, &assigneeEmail,
		); err != nil {
			return types.CursorResult[types.Task]{}, err
		}
		t.Project = &proj
		if assigneeID != nil {
			t.Assignee = &types.UserBrief{ID: *assigneeID, Name: derefString(assigneeName), Email: derefString(assigneeEmail)}
		}
		tasks = append(tasks, t)
	}
	if err := rows.Err(); err != nil {
		return types.CursorResult[types.Task]{}, err
	}

	return pagination.BuildCursorResult(tasks, params.Limit, func(t types.Task) string {
		return pagination.EncodeCursor(t.CreatedAt, t.ID)
	}), nil
}

func derefString(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}
