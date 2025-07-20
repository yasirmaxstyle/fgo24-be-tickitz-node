package models

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"noir-backend/utils"
	"time"

	"github.com/jackc/pgx/v5"
)

type User struct {
	UserID       int        `json:"userId" db:"user_id"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	Role         string     `json:"-" db:"role"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
	LastLogin    *time.Time `json:"lastLogin,omitempty" db:"last_login"`
}

type Profile struct {
	UserID      *int       `json:"userId" db:"user_id"`
	FirstName   *string    `json:"firstName" db:"first_name"`
	LastName    *string    `json:"lastName" db:"last_name"`
	Email       string     `json:"email" db:"email"`
	AvatarPath  *string    `json:"avatar_path" db:"avatar_path"`
	PhoneNumber *string    `json:"phoneNumber" db:"phone_number"`
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time  `json:"updatedAt" db:"updated_at"`
	LastLogin   *time.Time `json:"lastLogin" db:"last_login"`
}

type PasswordReset struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"used"`
	CreatedAt time.Time `json:"created_at"`
}

func CreateUser(req RegisterRequest) (*User, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(context.Background())

	var exists bool
	err = tx.QueryRow(context.Background(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)",
		req.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &User{
		Email:        req.Email,
		PasswordHash: hashedPassword,
	}

	err = tx.QueryRow(context.Background(), `
		INSERT INTO users (email, password_hash, role)
		VALUES ($1, $2, 'user')
		RETURNING user_id`,
		user.Email, user.PasswordHash).
		Scan(&user.UserID)
	if err != nil {
		return nil, err
	}

	err = tx.QueryRow(context.Background(), `
		INSERT INTO profile (user_id) 
		VALUES ($1)
		RETURNING user_id`,
		user.UserID).Scan(&user.UserID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return user, tx.Commit(context.Background())
}

func Login(req *LoginRequest) (*AuthResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	user := &User{}
	err = conn.QueryRow(context.Background(),
		"SELECT user_id, email, password_hash, role, created_at, updated_at, last_login FROM users WHERE email = $1",
		req.Email).Scan(&user.UserID, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin)
	if err != nil {
		fmt.Println(err)
		return nil, errors.New("invalid credentials")
	}

	if err := utils.CheckPasswordHash(req.Password, user.PasswordHash); err != nil {
		return nil, errors.New("invalid credentials")
	}

	token, err := utils.GenerateTokens(user.UserID, user.Role)
	if err != nil {
		return nil, err
	}

	if err := UpdateLastLogin(&user.UserID); err != nil {
		return nil, err
	}
	// fmt.Println(&user.LastLogin)

	return &AuthResponse{
		User:  user,
		Token: token,
	}, nil
}

func UpdateLastLogin(userID *int) error {
	conn, err := utils.ConnectDB()
	if err != nil {
		return err
	}
	defer utils.CloseDB(conn)

	query := `UPDATE users SET last_login = $1 WHERE user_id = $2`
	_, err = conn.Exec(context.Background(), query, time.Now(), userID)
	return err
}

func GetUserByID(userID int) (*Profile, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	var user Profile
	err = conn.QueryRow(context.Background(),
		`SELECT profile_id, first_name, last_name, email, phone_number, p.created_at, p.updated_at, last_login FROM profile p
		JOIN users u ON u.user_id = p.user_id
		WHERE p.user_id = $1`,
		userID).Scan(&user.UserID, &user.FirstName, &user.LastName, &user.Email, &user.PhoneNumber, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &user, nil
}

func Logout(token string) error {
	// Blacklist refresh token
	return utils.InitRedis().Set(context.Background(), fmt.Sprintf("blacklist-token:%s", token), "1", 24*time.Hour).Err()
}

//forgot password

func ForgotPassword(email string) (*APIResponse, error) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	defer utils.CloseDB(conn)

	var userID int
	err = conn.QueryRow(context.Background(),
		"SELECT user_id FROM users WHERE email = $1", email).Scan(&userID)

	if err == pgx.ErrNoRows {
		return &APIResponse{
			Success: true,
			Message: "If the email exists, a reset link has been sent",
		}, nil
	} else if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}
	token, err := utils.GenerateTokens(userID, "user")
	if err != nil {
		return nil, fmt.Errorf("failed to generate token reset: %w", err)
	}

	utils.InitRedis().Set(context.Background(), fmt.Sprintf("reset-pwd:%s", token), "1", 1*time.Hour).Err()

	if err := sendResetEmail(email, token); err != nil {
		log.Printf("Failed to send reset email: %v", err)
		return nil, fmt.Errorf("failed to send reset email")
	}

	return &APIResponse{
		Success: true,
		Message: "If the email exists, a reset link has been sent",
	}, nil

}

func ResetPassword(req ResetPasswordRequest, token string) (*APIResponse, *HTTPError) {
	conn, err := utils.ConnectDB()
	if err != nil {
		return nil, &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "failed to connect to database",
		}
	}

	expCmd := utils.InitRedis().Exists(context.Background(), fmt.Sprintf("reset-pwd:%s", token))
	if expCmd.Val() == 0 {
		return nil, &HTTPError{
			Error:   http.StatusBadRequest,
			Message: "Invalid or expired reset token",
		}
	}

	claims, err := utils.ValidateToken(token)
	if err != nil {
		return nil, &HTTPError{
			Error:   http.StatusBadRequest,
			Message: "Invalid token",
		}
	}

	userID := int(claims["user_id"].(float64))

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return nil, &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Failed to hash password",
		}
	}

	tx, err := conn.Begin(context.Background())
	if err != nil {
		return nil, &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Database error",
		}
	}
	defer tx.Rollback(context.Background())

	_, err = tx.Exec(context.Background(),
		"UPDATE users SET password_hash = $1 WHERE user_id = $2",
		hashedPassword, userID)

	if err != nil {
		fmt.Println(err)
		return nil, &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Failed to update password",
		}
	}

	if err = tx.Commit(context.Background()); err != nil {
		return nil, &HTTPError{
			Error:   http.StatusInternalServerError,
			Message: "Failed to commit changes",
		}
	}

	utils.InitRedis().Del(context.Background(), fmt.Sprintf("reset-pwd:%s", token)).Err()

	return &APIResponse{
		Success: true,
		Message: "Password reset successfully",
	}, nil
}

func sendResetEmail(email, token string) error {
	resetURL := fmt.Sprintf("http://localhost:8080/reset-password?token=%s", token)
	subject := "Password Reset Request"
	body := fmt.Sprintf(`
Hello,

You have requested to reset your password. Please click the link below to reset your password:

%s

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
Noir
`, resetURL)

	msg := fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s", email, subject, body)

	config := utils.Load().SMTP

	auth := smtp.PlainAuth("", config.Username, config.Password, config.Host)

	addr := fmt.Sprintf("%s:%d", config.Host, config.Port)
	return smtp.SendMail(addr, auth, config.From, []string{email}, []byte(msg))
}
