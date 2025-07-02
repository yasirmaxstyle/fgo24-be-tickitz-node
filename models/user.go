package models

import (
	"context"
	"errors"
	"fmt"
	"noir-backend/utils"
	"time"
)

type User struct {
	UserID       int        `json:"userId" db:"user_id"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
	LastLogin    *time.Time `json:"lastLogin" db:"last_login"`
}

type Profile struct {
	UserID       int        `json:"userId" db:"user_id"`
	FullName     string     `json:"fullName" db:"full_name"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	AvatarPath   string     `json:"avatar_path" db:"avatar_path"`
	PhoneNumber  string     `json:"phoneNumber" db:"phone_number"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
	LastLogin    *time.Time `json:"lastLogin" db:"last_login"`
}

func CreateUser(req *User) error {
	conn, err := utils.ConnectDB()
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	var exists bool
	err = tx.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",
		req.Email).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("user already exists")
	}

	hashedPassword, err := utils.HashPassword(req.PasswordHash)
	if err != nil {
		return err
	}

	var user User
	err = tx.QueryRow(context.Background(),
		`INSERT INTO users (email, password_hash, ) 
        	VALUES ($1, $2, $3) 
        	RETURNING id, email, created_at, updated_at`,
		req.Email, string(hashedPassword)).
		Scan(&user.UserID, &user.Email, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return err
	}

	return tx.Commit(context.Background())
}

func Login(req *LoginRequest) (*AuthResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)
	var user User
	err = conn.QueryRow(context.Background(),
		"SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
		req.Email).Scan(&user.UserID, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}

	token, err := utils.GenerateTokens(user.UserID, "user")
	if err != nil {
		return nil, err
	}

	UpdateLastLogin(user.UserID)

	return &AuthResponse{
		User:  &user,
		Token: token,
	}, nil
}

func UpdateLastLogin(userID int) error {
	conn, err := utils.ConnectDB()
	if err != nil {
		return err
	}
	defer utils.CloseDB(conn)

	query := `UPDATE users SET last_login = $1 WHERE user_id = $2`
	_, err = conn.Exec(context.Background(), query, time.Now(), userID)
	return err
}
