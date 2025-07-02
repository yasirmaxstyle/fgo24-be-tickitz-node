package utils

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func ConnectDB() (*pgxpool.Conn, error) {
	godotenv.Load()
	dbURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		Load().DBUser,
		Load().DBPassword,
		Load().DBHost,
		Load().DBPort,
		Load().DBName,
	)

	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	conn, err := pool.Acquire(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failedto create connection from pool: %w", err)
	}

	return conn, nil
}

func CloseDB(conn *pgxpool.Conn) {
	if conn != nil {
		conn.Conn().Close(context.Background())
	}
}
