package router

import (
	"noir-backend/controllers"
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
)

func authRouter(r *gin.RouterGroup) {
	r.POST("/register", controllers.Register)
	r.POST("/login", controllers.Login)
	r.POST("/forgot-password", controllers.ForgotPassword)
	r.POST("/reset-password", controllers.ResetPassword)
	r.Use(middleware.AuthMiddleware())
	r.POST("/logout", controllers.Logout)
}
