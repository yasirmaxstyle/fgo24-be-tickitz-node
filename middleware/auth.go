package middleware

import (
	"net/http"
	"noir-backend/models"
	"noir-backend/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			models.NewError(c, http.StatusUnauthorized, "Authorization header required")
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			models.NewError(c, http.StatusUnauthorized, "Bearer token required")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			models.NewError(c, http.StatusUnauthorized, err.Error())
			c.Abort()
			return
		}

		c.Set("user_id", int(claims["user_id"].(float64)))
		c.Set("role", claims["role"])
		c.Next()
	}
}
