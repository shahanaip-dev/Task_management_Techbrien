package db

import (
	"context"
	"fmt"
	"time"

	"tmt-server-go/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(cfg config.DBConfig) (*pgxpool.Pool, error) {
	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.Name,
	)

	poolCfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}

	poolCfg.MaxConns = 10
	poolCfg.MaxConnIdleTime = 30 * time.Second
	poolCfg.MaxConnLifetime = 60 * time.Minute

	pool, err := pgxpool.NewWithConfig(context.Background(), poolCfg)
	if err != nil {
		return nil, err
	}

	return pool, nil
}
