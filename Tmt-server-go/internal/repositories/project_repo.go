package repositories

import (
	"context"
	"errors"
	"strconv"
	"strings"

	"tmt-server-go/internal/pagination"
	"tmt-server-go/internal/types"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProjectRepository struct {
	db *pgxpool.Pool
}

func NewProjectRepository(db *pgxpool.Pool) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) FindByID(ctx context.Context, id string) (*types.Project, error) {
	const q = `SELECT id, name, description, created_by, created_at FROM projects WHERE id = $1`
	row := r.db.QueryRow(ctx, q, id)

	var p types.Project
	if err := row.Scan(&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *ProjectRepository) FindByIDWithCreator(ctx context.Context, id string) (*types.Project, error) {
	const q = `SELECT
		p.id, p.name, p.description, p.created_by, p.created_at,
		u.id AS creator_id, u.name AS creator_name, u.email AS creator_email,
		COALESCE(tc.task_count, 0) AS task_count,
		ARRAY(SELECT pm.user_id::text FROM project_members pm WHERE pm.project_id = p.id) AS member_ids
	FROM projects p
	JOIN users u ON u.id = p.created_by
	LEFT JOIN (
		SELECT project_id, COUNT(*)::int AS task_count
		FROM tasks
		GROUP BY project_id
	) tc ON tc.project_id = p.id
	WHERE p.id = $1`

	row := r.db.QueryRow(ctx, q, id)

	var p types.Project
	var creator types.UserBrief
	if err := row.Scan(
		&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt,
		&creator.ID, &creator.Name, &creator.Email,
		&p.TaskCount, &p.MemberIDs,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.Creator = &creator
	return &p, nil
}

func (r *ProjectRepository) Create(ctx context.Context, data struct {
	Name        string
	Description *string
	CreatedBy   string
	MemberIDs   []string
}) (types.Project, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return types.Project{}, err
	}
	defer tx.Rollback(ctx)

	const insertProject = `INSERT INTO projects (name, description, created_by)
	VALUES ($1, $2, $3)
	RETURNING id, name, description, created_by, created_at`
	var p types.Project
	if err := tx.QueryRow(ctx, insertProject, data.Name, data.Description, data.CreatedBy).
		Scan(&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt); err != nil {
		return types.Project{}, err
	}

	memberIDs := uniqueStrings(append([]string{data.CreatedBy}, data.MemberIDs...))
	if len(memberIDs) > 0 {
		_, err = tx.Exec(ctx, `INSERT INTO project_members (project_id, user_id)
			SELECT $1, unnest($2::uuid[])
			ON CONFLICT DO NOTHING`, p.ID, memberIDs)
		if err != nil {
			return types.Project{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return types.Project{}, err
	}
	return p, nil
}

func (r *ProjectRepository) Update(ctx context.Context, id string, data struct {
	Name        *string
	Description *string
	MemberIDs   *[]string
}) (types.Project, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return types.Project{}, err
	}
	defer tx.Rollback(ctx)

	fields := []string{}
	values := []any{}
	idx := 1

	if data.Name != nil {
		fields = append(fields, "name = $"+itoa(idx))
		values = append(values, *data.Name)
		idx++
	}
	if data.Description != nil {
		fields = append(fields, "description = $"+itoa(idx))
		values = append(values, *data.Description)
		idx++
	}

	var p types.Project
	if len(fields) > 0 {
		values = append(values, id)
		q := `UPDATE projects SET ` + strings.Join(fields, ", ") + ` WHERE id = $` + itoa(idx) +
			` RETURNING id, name, description, created_by, created_at`
		if err := tx.QueryRow(ctx, q, values...).Scan(&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt); err != nil {
			return types.Project{}, err
		}
	} else {
		const q = `SELECT id, name, description, created_by, created_at FROM projects WHERE id = $1`
		if err := tx.QueryRow(ctx, q, id).Scan(&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt); err != nil {
			return types.Project{}, err
		}
	}

	if data.MemberIDs != nil {
		if _, err := tx.Exec(ctx, `DELETE FROM project_members WHERE project_id = $1`, id); err != nil {
			return types.Project{}, err
		}

		var creatorID string
		if err := tx.QueryRow(ctx, `SELECT created_by FROM projects WHERE id = $1`, id).Scan(&creatorID); err != nil {
			return types.Project{}, err
		}

		memberIDs := uniqueStrings(append([]string{creatorID}, (*data.MemberIDs)...))
		if len(memberIDs) > 0 {
			if _, err := tx.Exec(ctx, `INSERT INTO project_members (project_id, user_id)
				SELECT $1, unnest($2::uuid[])
				ON CONFLICT DO NOTHING`, id, memberIDs); err != nil {
				return types.Project{}, err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return types.Project{}, err
	}
	return p, nil
}

func (r *ProjectRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM projects WHERE id = $1`, id)
	return err
}

func (r *ProjectRepository) FindMany(ctx context.Context, params pagination.CursorParams, name string) (types.CursorResult[types.Project], error) {
	conditions := []string{}
	values := []any{}
	idx := 1

	if name != "" {
		conditions = append(conditions, "p.name ILIKE $"+itoa(idx))
		values = append(values, "%"+name+"%")
		idx++
	}
	if createdAt, cid, ok := pagination.DecodeCursor(params.Cursor); ok {
		conditions = append(conditions, "(p.created_at, p.id) < ($"+itoa(idx)+", $"+itoa(idx+1)+")")
		values = append(values, createdAt, cid)
		idx += 2
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	q := `SELECT
		p.id, p.name, p.description, p.created_by, p.created_at,
		u.id AS creator_id, u.name AS creator_name, u.email AS creator_email,
		COALESCE(tc.task_count, 0) AS task_count,
		ARRAY(SELECT pm.user_id::text FROM project_members pm WHERE pm.project_id = p.id) AS member_ids
	FROM projects p
	JOIN users u ON u.id = p.created_by
	LEFT JOIN (
		SELECT project_id, COUNT(*)::int AS task_count
		FROM tasks
		GROUP BY project_id
	) tc ON tc.project_id = p.id
	` + where + `
	ORDER BY p.created_at DESC, p.id DESC
	LIMIT $` + itoa(idx)

	rows, err := r.db.Query(ctx, q, append(values, params.Limit+1)...)
	if err != nil {
		return types.CursorResult[types.Project]{}, err
	}
	defer rows.Close()

	var projects []types.Project
	for rows.Next() {
		var p types.Project
		var creator types.UserBrief
		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt,
			&creator.ID, &creator.Name, &creator.Email,
			&p.TaskCount, &p.MemberIDs,
		); err != nil {
			return types.CursorResult[types.Project]{}, err
		}
		p.Creator = &creator
		projects = append(projects, p)
	}
	if err := rows.Err(); err != nil {
		return types.CursorResult[types.Project]{}, err
	}

	return pagination.BuildCursorResult(projects, params.Limit, func(p types.Project) string {
		return pagination.EncodeCursor(p.CreatedAt, p.ID)
	}), nil
}

func (r *ProjectRepository) FindManyForUser(ctx context.Context, userID string, params pagination.CursorParams, name string) (types.CursorResult[types.Project], error) {
	conditions := []string{}
	values := []any{userID}
	idx := 2

	if name != "" {
		conditions = append(conditions, "p.name ILIKE $"+itoa(idx))
		values = append(values, "%"+name+"%")
		idx++
	}
	if createdAt, cid, ok := pagination.DecodeCursor(params.Cursor); ok {
		conditions = append(conditions, "(p.created_at, p.id) < ($"+itoa(idx)+", $"+itoa(idx+1)+")")
		values = append(values, createdAt, cid)
		idx += 2
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	q := `SELECT
		p.id, p.name, p.description, p.created_by, p.created_at,
		u.id AS creator_id, u.name AS creator_name, u.email AS creator_email,
		COALESCE(tc.task_count, 0) AS task_count,
		ARRAY(SELECT pm2.user_id::text FROM project_members pm2 WHERE pm2.project_id = p.id) AS member_ids
	FROM projects p
	JOIN users u ON u.id = p.created_by
	JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
	LEFT JOIN (
		SELECT project_id, assigned_to, COUNT(*)::int AS task_count
		FROM tasks
		GROUP BY project_id, assigned_to
	) tc ON tc.project_id = p.id AND tc.assigned_to = $1
	` + where + `
	ORDER BY p.created_at DESC, p.id DESC
	LIMIT $` + itoa(idx)

	rows, err := r.db.Query(ctx, q, append(values, params.Limit+1)...)
	if err != nil {
		return types.CursorResult[types.Project]{}, err
	}
	defer rows.Close()

	var projects []types.Project
	for rows.Next() {
		var p types.Project
		var creator types.UserBrief
		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt,
			&creator.ID, &creator.Name, &creator.Email,
			&p.TaskCount, &p.MemberIDs,
		); err != nil {
			return types.CursorResult[types.Project]{}, err
		}
		p.Creator = &creator
		projects = append(projects, p)
	}
	if err := rows.Err(); err != nil {
		return types.CursorResult[types.Project]{}, err
	}

	return pagination.BuildCursorResult(projects, params.Limit, func(p types.Project) string {
		return pagination.EncodeCursor(p.CreatedAt, p.ID)
	}), nil
}

func (r *ProjectRepository) FindByIDWithCreatorForUser(ctx context.Context, id, userID string) (*types.Project, error) {
	const q = `SELECT
		p.id, p.name, p.description, p.created_by, p.created_at,
		u.id AS creator_id, u.name AS creator_name, u.email AS creator_email,
		COALESCE(tc.task_count, 0) AS task_count,
		ARRAY(SELECT pm2.user_id::text FROM project_members pm2 WHERE pm2.project_id = p.id) AS member_ids
	FROM projects p
	JOIN users u ON u.id = p.created_by
	JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
	LEFT JOIN (
		SELECT project_id, assigned_to, COUNT(*)::int AS task_count
		FROM tasks
		GROUP BY project_id, assigned_to
	) tc ON tc.project_id = p.id AND tc.assigned_to = $2
	WHERE p.id = $1
	GROUP BY p.id, u.id, tc.task_count`

	row := r.db.QueryRow(ctx, q, id, userID)
	var p types.Project
	var creator types.UserBrief
	if err := row.Scan(
		&p.ID, &p.Name, &p.Description, &p.CreatedBy, &p.CreatedAt,
		&creator.ID, &creator.Name, &creator.Email,
		&p.TaskCount, &p.MemberIDs,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	p.Creator = &creator
	return &p, nil
}

func (r *ProjectRepository) IsMember(ctx context.Context, projectID, userID string) (bool, error) {
	const q = `SELECT EXISTS (
		SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2
	) AS exists`
	var exists bool
	if err := r.db.QueryRow(ctx, q, projectID, userID).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}

func uniqueStrings(in []string) []string {
	seen := make(map[string]struct{}, len(in))
	var out []string
	for _, v := range in {
		if v == "" {
			continue
		}
		if _, ok := seen[v]; ok {
			continue
		}
		seen[v] = struct{}{}
		out = append(out, v)
	}
	return out
}

func itoa(n int) string {
	return strconv.Itoa(n)
}
