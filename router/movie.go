package router

import (
	"noir-backend/middleware"

	"github.com/gin-gonic/gin"
)

func movieRouter(r *gin.RouterGroup) {
	r.Use(middleware.AuthMiddleware())
	r.GET("/upcoming-movies")
	r.GET("/now-playing-movies")
	r.GET("/")       //get all movies
	r.GET("/:id")    //get specific movie
}
