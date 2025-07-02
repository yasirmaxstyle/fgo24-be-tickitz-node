package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateTokens(userID int, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	token, err := accessToken.SignedString([]byte(Load().JWTSecret))
	if err != nil {
		return "", err
	}

	return token, nil
}
