package router

import (
	"noir-backend/controllers"
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
)

func transactionRouter(r *gin.RouterGroup) {
	r.Use(middleware.AuthMiddleware())
	r.POST("/", controllers.CreateTransaction)
	r.POST("/payment", controllers.ProcessPayment)
	
}
