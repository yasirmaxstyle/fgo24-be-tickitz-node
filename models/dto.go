package models

import (
	"time"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Email           string `form:"email" binding:"required,email"`
	Password        string `form:"password" binding:"required,min=8"`
	ConfirmPassword string `form:"confirmPassword" binding:"required"`
}

type LoginRequest struct {
	Email    string `form:"email" json:"email" binding:"required,email"`
	Password string `form:"password" json:"password" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   *string     `json:"error,omitempty"`
}

type AuthResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}

type PasswordResetRequest struct {
	Email string `form:"email" json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	NewPassword string `form:"newPassword" json:"new_password" binding:"required,min=6"`
}

type HTTPError struct {
	Error   int    `json:"error"`
	Message string `json:"message"`
}

func NewError(c *gin.Context, status int, err string) {
	er := HTTPError{
		Error:   status,
		Message: err,
	}
	c.JSON(status, er)
}

type CreateMovieRequest struct {
	Title       string    `json:"title" binding:"required"`
	Overview    string    `json:"overview" binding:"required"`
	Duration    int       `json:"duration" binding:"required,min=1"`
	ReleaseDate time.Time `json:"release_date" binding:"required"`
	DirectorsID *int      `json:"directors_id"`
	Genres      []string  `json:"genres"`
}

type UpdateMovieRequest struct {
	Title       *string    `json:"title"`
	Overview    *string    `json:"overview"`
	Duration    *int       `json:"duration"`
	ReleaseDate *time.Time `json:"release_date"`
	DirectorsID *int       `json:"directors_id"`
	Genres      []string   `json:"genres"`
}

type CreateTransactionRequest struct {
	ShowtimeID        int      `json:"showtime_id" binding:"required"`
	SeatNumbers       []string `json:"seat_numbers" binding:"required"`
	RecipientEmail    string   `json:"recipient_email" binding:"required,email"`
	RecipientFullName string   `json:"recipient_full_name" binding:"required"`
	RecipientPhone    string   `json:"recipient_phone_number" binding:"required"`
	PaymentMethodID   int      `json:"payment_method_id" binding:"required"`
}

type ProcessPaymentRequest struct {
	TransactionCode string `json:"transaction_code" binding:"required"`
	PaymentProof    string `json:"payment_proof,omitempty"`
}

type TransactionResponse struct {
	Transaction Transaction `json:"transaction"`
	Tickets     []Ticket    `json:"tickets"`
}
