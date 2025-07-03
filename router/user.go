package router

import (
	"noir-backend/controllers"
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
)

func userRouter(r *gin.RouterGroup) {
	r.Use(middleware.AuthMiddleware())
	r.GET("/:id", controllers.GetProfile)
	r.PATCH("/:id") //edit profile
}
