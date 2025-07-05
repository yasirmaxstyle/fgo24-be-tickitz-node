package middleware

import (
	"log"
	"net/http"
	"noir-backend/models"

	"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			log.Printf("Panic recovered: %s", err)
			models.NewError(c, http.StatusInternalServerError, "Internal server error")
		}
		c.Abort()
	})
}
