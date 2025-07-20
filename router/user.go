package router

import (
	"noir-backend/controllers"
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
)

func userRouter(r *gin.RouterGroup) {
	r.Use(middleware.AuthMiddleware())
	r.GET("/", controllers.GetProfile)
	r.PATCH("/") //edit profile
}
