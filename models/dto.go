package models

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"full_name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `jsong:"message"`
	Data    interface{} `json:"data"`
	Error   string      `json:"error"`
}

type AuthResponse struct {
	User  *User  `json:"user"`
	Token string `json:"token"`
}
