package models

import (
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
