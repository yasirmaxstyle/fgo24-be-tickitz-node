package models

import (
	"context"
	"noir-backend/utils"
	"time"
)

type User struct {
	UserID       int        `json:"userId" db:"user_id"`
	FullName     string     `json:"fullName" db:"full_name"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	PhoneNumber  string     `json:"phoneNumber" db:"phone_number"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
	LastLogin    *time.Time `json:"lastLogin" db:"last_login"`
}

func CreateUser(user *User) error {
	conn, err := utils.ConnectDB()
	if err != nil {
		return err
	}
	defer conn.Close()

	query := `
	INSERT INTO user (full_name, email, password_hash, phone_number, created_at, updated_at)
	VALUES ($1 $2 $3 $4 $5 $6)
	RETURNING user_id`

	err = conn.QueryRow(context.Background(), query,
		user.FullName,
		user.Email,
		user.PasswordHash,
		user.PhoneNumber,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.UserID)

	return err
}
