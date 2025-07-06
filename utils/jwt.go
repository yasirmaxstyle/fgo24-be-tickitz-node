package utils

import (
	"errors"
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

func ValidateToken(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(Load().JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}
