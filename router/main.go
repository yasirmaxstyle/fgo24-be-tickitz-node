package router

import (
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
)

func CombineRouter(r *gin.Engine) {
	r.Use(middleware.CORS())
	authRouter(r.Group("/auth"))
	userRouter(r.Group("/user"))
}
