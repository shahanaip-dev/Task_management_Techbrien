package repositories

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type User struct {
	ID        string
	Name      string
	Email     string
	Password  string
	Role      string
	CreatedAt time.Time
}

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
	const q = `SELECT id, name, email, password, role, created_at
	FROM users WHERE email = $1`
	row := r.db.QueryRow(ctx, q, strings.ToLower(strings.TrimSpace(email)))

	var u User
	if err := row.Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}
