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

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*types.User, error) {
	const q = `SELECT id, name, email, password, role, created_at
	FROM users WHERE email = $1`
	row := r.db.QueryRow(ctx, q, strings.ToLower(strings.TrimSpace(email)))

	var u types.User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindById(ctx context.Context, id string) (*types.User, error) {
	const q = `SELECT id, name, email, password, role, created_at FROM users WHERE id = $1`
	row := r.db.QueryRow(ctx, q, id)

	var u types.User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindPublicById(ctx context.Context, id string) (*types.User, error) {
	const q = `SELECT id, name, email, role, created_at FROM users WHERE id = $1`
	row := r.db.QueryRow(ctx, q, id)

	var u types.User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) FindIDByEmail(ctx context.Context, email string) (string, error) {
	const q = `SELECT id FROM users WHERE email = $1`
	row := r.db.QueryRow(ctx, q, strings.ToLower(strings.TrimSpace(email)))
	var id string
	if err := row.Scan(&id); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return id, nil
}

func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	const q = `SELECT COUNT(*)::int AS count FROM users WHERE email = $1`
	row := r.db.QueryRow(ctx, q, strings.ToLower(strings.TrimSpace(email)))
	var count int
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *UserRepository) Create(ctx context.Context, data struct {
	Name     string
	Email    string
	Password string
	Role     types.Role
}) (types.User, error) {
	const q = `INSERT INTO users (name, email, password, role)
	VALUES ($1, $2, $3, $4)
	RETURNING id, name, email, role, created_at`
	row := r.db.QueryRow(ctx, q, data.Name, strings.ToLower(strings.TrimSpace(data.Email)), data.Password, data.Role)

	var u types.User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt); err != nil {
		return types.User{}, err
	}
	return u, nil
}

func (r *UserRepository) Update(ctx context.Context, id string, data struct {
	Name     *string
	Email    *string
	Password *string
	Role     *types.Role
}) (types.User, error) {
	fields := []string{}
	values := []any{}
	idx := 1

	if data.Name != nil {
		fields = append(fields, "name = $"+strconv.Itoa(idx))
		values = append(values, *data.Name)
		idx++
	}
	if data.Email != nil {
		fields = append(fields, "email = $"+strconv.Itoa(idx))
		values = append(values, strings.ToLower(strings.TrimSpace(*data.Email)))
		idx++
	}
	if data.Password != nil {
		fields = append(fields, "password = $"+strconv.Itoa(idx))
		values = append(values, *data.Password)
		idx++
	}
	if data.Role != nil {
		fields = append(fields, "role = $"+strconv.Itoa(idx))
		values = append(values, *data.Role)
		idx++
	}

	values = append(values, id)
	q := `UPDATE users SET ` + strings.Join(fields, ", ") + ` WHERE id = $` + strconv.Itoa(idx) +
		` RETURNING id, name, email, role, created_at`

	row := r.db.QueryRow(ctx, q, values...)
	var u types.User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt); err != nil {
		return types.User{}, err
	}
	return u, nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	return err
}

func (r *UserRepository) FindMany(ctx context.Context, params pagination.CursorParams) (types.CursorResult[types.User], error) {
	conditions := []string{}
	values := []any{}
	idx := 1

	if createdAt, cid, ok := pagination.DecodeCursor(params.Cursor); ok {
		conditions = append(conditions, `(created_at, id) < ($`+strconv.Itoa(idx)+`, $`+strconv.Itoa(idx+1)+`)`)
		values = append(values, createdAt, cid)
		idx += 2
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	q := `SELECT id, name, email, role, created_at
	FROM users
	` + where + `
	ORDER BY created_at DESC, id DESC
	LIMIT $` + strconv.Itoa(idx)

	rows, err := r.db.Query(ctx, q, append(values, params.Limit+1)...)
	if err != nil {
		return types.CursorResult[types.User]{}, err
	}
	defer rows.Close()

	var users []types.User
	for rows.Next() {
		var u types.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt); err != nil {
			return types.CursorResult[types.User]{}, err
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return types.CursorResult[types.User]{}, err
	}

	return pagination.BuildCursorResult(users, params.Limit, func(u types.User) string {
		return pagination.EncodeCursor(u.CreatedAt, u.ID)
	}), nil
}
