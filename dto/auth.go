package dto

type RegisterRequest struct {
	FullName string
	Email    string
	Password string
}

type LoginRequest struct {
	Email    string
	Password string
}
