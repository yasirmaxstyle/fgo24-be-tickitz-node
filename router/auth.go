package router

import "github.com/gin-gonic/gin"

func authRouter(r *gin.RouterGroup) {
	r.POST("/register")
	r.POST("/login")
}
