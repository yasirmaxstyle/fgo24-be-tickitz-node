package router

import (
	docs "noir-backend/docs"
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func CombineRouter(r *gin.Engine) {
	docs.SwaggerInfo.BasePath = "/"
	r.Use(middleware.CORS())
	r.Use(middleware.ErrorHandler())
	authRouter(r.Group("/auth"))
	adminRouter(r.Group("/admin"))
	userRouter(r.Group("/profile"))
	movieRouter(r.Group("/movie"))
	transactionRouter(r.Group("/transaction"))

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))
}
